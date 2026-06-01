package com.momentpages.payment;

import com.momentpages.project.ProjectService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.exception.StripeException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final ProjectService projectService;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public PaymentController(PaymentService paymentService, ProjectService projectService) {
        this.paymentService = paymentService;
        this.projectService = projectService;
    }

    @PostMapping("/projects/{projectId}/checkout")
    public ResponseEntity<?> createCheckout(
            @PathVariable UUID projectId,
            @RequestHeader("X-Management-Token") String token) {
        projectService.validateManagementToken(projectId, token);

        try {
            var result = paymentService.createPublishCheckout(projectId, token);
            return ResponseEntity.ok(Map.of(
                    "stripeCheckoutUrl", result.checkoutUrl(),
                    "sessionId", result.sessionId()
            ));
        } catch (StripeException e) {
            log.error("Stripe checkout creation failed", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Payment initialization failed"));
        }
    }

    @PostMapping("/webhooks/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (SignatureVerificationException e) {
            log.warn("Stripe webhook signature verification failed");
            return ResponseEntity.badRequest().body("Invalid signature");
        }

        switch (event.getType()) {
            case "checkout.session.completed" -> {
                var session = (com.stripe.model.checkout.Session) event.getDataObjectDeserializer()
                        .getObject().orElse(null);
                if (session != null) {
                    paymentService.handleCheckoutCompleted(session.getId());
                }
            }
            case "payment_intent.payment_failed" -> {
                // Extract session ID from payment intent if available
                log.warn("Payment failed event received: {}", event.getId());
            }
            default -> log.debug("Unhandled Stripe event type: {}", event.getType());
        }

        return ResponseEntity.ok("OK");
    }
}
