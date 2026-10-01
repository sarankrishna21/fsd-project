package com.library.store.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Payment service abstraction.
 * Currently implements demo/test payment flow.
 * To integrate Razorpay or Stripe, implement the same interface.
 */
@Service
@Slf4j
public class PaymentService {

    /**
     * Creates a payment order.
     * In production, this would call Razorpay/Stripe API to create an order.
     */
    public Map<String, Object> createPaymentOrder(BigDecimal amount, String currency, String orderRef) {
        log.info("Creating payment order for amount: {} {}", amount, currency);

        // Demo implementation - in production replace with Razorpay/Stripe API call
        Map<String, Object> response = new HashMap<>();
        response.put("paymentOrderId", "demo_" + UUID.randomUUID().toString().substring(0, 8));
        response.put("amount", amount);
        response.put("currency", currency);
        response.put("orderRef", orderRef);
        response.put("status", "CREATED");
        response.put("mode", "DEMO");

        return response;
    }

    /**
     * Verifies payment completion.
     * In production, this would verify signature with Razorpay/Stripe webhook.
     */
    public boolean verifyPayment(String paymentId, String orderRef, String signature) {
        log.info("Verifying payment: {} for order: {}", paymentId, orderRef);

        // Demo: any payment starting with "demo_" or "pay_test" is valid
        if (paymentId != null && (paymentId.startsWith("demo_") || paymentId.startsWith("pay_test"))) {
            return true;
        }

        // In production: verify HMAC signature with Razorpay/Stripe secret
        return true; // Demo mode always succeeds
    }

    /**
     * Processes refund.
     * In production, this would call the payment provider refund API.
     */
    public boolean processRefund(String paymentId, BigDecimal amount) {
        log.info("Processing refund for payment: {} amount: {}", paymentId, amount);
        // Demo implementation
        return true;
    }
}
