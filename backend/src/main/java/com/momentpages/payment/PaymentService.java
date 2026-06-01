package com.momentpages.payment;

import com.momentpages.project.Project;
import com.momentpages.project.ProjectService;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final ProjectService projectService;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    public PaymentService(PaymentRepository paymentRepository, ProjectService projectService) {
        this.paymentRepository = paymentRepository;
        this.projectService = projectService;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public record CheckoutResult(String checkoutUrl, String sessionId) {}

    public CheckoutResult createPublishCheckout(UUID projectId, String managementToken) throws StripeException {
        Project project = projectService.getProjectById(projectId);

        String successUrl = frontendUrl + "/manage/" + managementToken + "?payment=success";
        String cancelUrl = frontendUrl + "/edit/" + projectId + "?payment=cancelled";

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .setSuccessUrl(successUrl)
                .setCancelUrl(cancelUrl)
                .addLineItem(SessionCreateParams.LineItem.builder()
                        .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                .setCurrency("gbp")
                                .setUnitAmount(199L) // £1.99 in pence
                                .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                        .setName("MomentPages - Publish Invitation")
                                        .setDescription("Publish your personalized invitation page")
                                        .build())
                                .build())
                        .setQuantity(1L)
                        .build())
                .putMetadata("project_id", projectId.toString())
                .putMetadata("payment_type", "publish")
                .build();

        Session session = Session.create(params);

        // Record payment
        Payment payment = new Payment();
        payment.setProjectId(projectId);
        payment.setStripeSessionId(session.getId());
        payment.setAmountCents(199);
        payment.setPaymentType("publish");
        paymentRepository.save(payment);

        return new CheckoutResult(session.getUrl(), session.getId());
    }

    @Transactional
    public void handleCheckoutCompleted(String sessionId) {
        if (paymentRepository.existsByStripeSessionId(sessionId)) {
            Payment payment = paymentRepository.findByStripeSessionId(sessionId).orElse(null);
            if (payment == null || "succeeded".equals(payment.getStatus())) {
                return; // Already processed (idempotent)
            }

            payment.setStatus("succeeded");
            payment.setCompletedAt(Instant.now());
            paymentRepository.save(payment);

            // Trigger project publish
            if ("publish".equals(payment.getPaymentType())) {
                projectService.publishProject(payment.getProjectId());
            } else if ("reactivation".equals(payment.getPaymentType())) {
                projectService.reactivateProject(payment.getProjectId());
            }

            log.info("Payment completed: session={}, project={}, type={}",
                    sessionId, payment.getProjectId(), payment.getPaymentType());
        }
    }

    @Transactional
    public void handlePaymentFailed(String sessionId) {
        paymentRepository.findByStripeSessionId(sessionId).ifPresent(payment -> {
            payment.setStatus("failed");
            paymentRepository.save(payment);
            log.warn("Payment failed: session={}, project={}", sessionId, payment.getProjectId());
        });
    }
}
