package com.momentpages.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitFilter extends OncePerRequestFilter {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        // Skip non-API requests
        if (!path.startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        String key = resolveKey(request, path);
        Bucket bucket = buckets.computeIfAbsent(key, k -> createBucket(path));

        if (bucket.tryConsume(1)) {
            filterChain.doFilter(request, response);
        } else {
            response.setStatus(429);
            response.setContentType("application/json");
            response.setHeader("Retry-After", "60");
            response.getWriter().write("{\"error\":\"Too many requests\",\"message\":\"Rate limit exceeded. Please try again later.\"}");
        }
    }

    private String resolveKey(HttpServletRequest request, String path) {
        // Use management token for authenticated endpoints
        String token = request.getHeader("X-Management-Token");
        if (token != null && !token.isEmpty()) {
            return "token:" + token.substring(0, Math.min(token.length(), 16));
        }

        // Use IP for public endpoints
        String forwarded = request.getHeader("X-Forwarded-For");
        String ip = forwarded != null ? forwarded.split(",")[0].trim() : request.getRemoteAddr();
        return "ip:" + ip + ":" + categorize(path);
    }

    private String categorize(String path) {
        if (path.contains("/ai/")) return "ai";
        if (path.contains("/public/")) return "public";
        return "management";
    }

    private Bucket createBucket(String path) {
        Bandwidth limit;
        if (path.contains("/ai/")) {
            // AI endpoints: 10 requests per minute
            limit = Bandwidth.classic(10, Refill.greedy(10, Duration.ofMinutes(1)));
        } else if (path.contains("/public/")) {
            // Public endpoints: 60 requests per minute
            limit = Bandwidth.classic(60, Refill.greedy(60, Duration.ofMinutes(1)));
        } else {
            // Management endpoints: 120 requests per minute
            limit = Bandwidth.classic(120, Refill.greedy(120, Duration.ofMinutes(1)));
        }
        return Bucket.builder().addLimit(limit).build();
    }
}
