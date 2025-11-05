package com.example.demo.Service;

import com.example.demo.dto.PayPalPaymentRequest;
import com.example.demo.config.PayPalConfig;
import com.paypal.api.payments.*;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.UUID;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class PaymentService {
    
    @Autowired
    private PayPalConfig payPalConfig;
    
    // Store payment metadata (in production, use Redis or database)
    private final Map<String, PaymentMetadata> paymentMetadata = new HashMap<>();
    
    // Metadata class to store payment info
    public static class PaymentMetadata {
        private Long listingId;
        private String buyerUserId;
        private boolean executed = false;
        
        public PaymentMetadata(Long listingId, String buyerUserId) {
            this.listingId = listingId;
            this.buyerUserId = buyerUserId;
        }
        
        public Long getListingId() { return listingId; }
        public String getBuyerUserId() { return buyerUserId; }
        public boolean isExecuted() { return executed; }
        public void setExecuted(boolean executed) { this.executed = executed; }
    }
    
    /**
     * Create a PayPal payment
     */
    public Map<String, String> createPayment(PayPalPaymentRequest request) throws PayPalRESTException {
        APIContext apiContext = new APIContext(payPalConfig.getClientId(), payPalConfig.getClientSecret(), payPalConfig.getMode());
        
        // Set up payment details
        Amount amount = new Amount();
        amount.setCurrency("USD");
        amount.setTotal(String.format("%.2f", request.getPrice().doubleValue())); // Price is already in dollars
        
        Transaction transaction = new Transaction();
        transaction.setDescription("Purchase: " + request.getItemName());
        transaction.setAmount(amount);
        
        // Add custom data
        transaction.setCustom(request.getListingId().toString());
        // Make invoice number unique to avoid duplicate transaction errors
        // Use listingId + timestamp + random UUID to ensure uniqueness
        String uniqueInvoiceNumber = request.getListingId() + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0, 8);
        transaction.setInvoiceNumber(uniqueInvoiceNumber);
        
        List<Transaction> transactions = new ArrayList<>();
        transactions.add(transaction);
        
        // Set payer
        Payer payer = new Payer();
        payer.setPaymentMethod("paypal");
        
        // Set redirect URLs - include listingId and buyerUserId in URL
        RedirectUrls redirectUrls = new RedirectUrls();
        redirectUrls.setCancelUrl(request.getCancelUrl());
        
        // Build return URL with properly encoded query parameters
        String baseUrl = request.getSuccessUrl();
        // Ensure base URL doesn't already have query parameters
        if (baseUrl.contains("?")) {
            baseUrl = baseUrl.substring(0, baseUrl.indexOf("?"));
        }
        
        // Build query string
        StringBuilder queryString = new StringBuilder();
        queryString.append("?listingId=").append(URLEncoder.encode(request.getListingId().toString(), StandardCharsets.UTF_8));
        
        if (request.getBuyerUserId() != null && !request.getBuyerUserId().isEmpty()) {
            queryString.append("&buyerUserId=").append(URLEncoder.encode(request.getBuyerUserId(), StandardCharsets.UTF_8));
        }
        
        String returnUrl = baseUrl + queryString.toString();
        System.out.println("Return URL: " + returnUrl);
        redirectUrls.setReturnUrl(returnUrl);
        
        Payment payment = new Payment();
        payment.setIntent("sale");
        payment.setPayer(payer);
        payment.setTransactions(transactions);
        payment.setRedirectUrls(redirectUrls);
        
        // Create payment
        Payment createdPayment = payment.create(apiContext);
        
        // Store metadata for this payment
        paymentMetadata.put(createdPayment.getId(), new PaymentMetadata(request.getListingId(), request.getBuyerUserId()));
        System.out.println("Stored payment metadata - paymentId: " + createdPayment.getId() + ", listingId: " + request.getListingId() + ", buyerUserId: " + request.getBuyerUserId());
        
        // Get approval URL
        String approvalUrl = null;
        List<Links> links = createdPayment.getLinks();
        for (Links link : links) {
            if (link.getRel().equalsIgnoreCase("approval_url")) {
                approvalUrl = link.getHref();
                break;
            }
        }
        
        Map<String, String> response = new HashMap<>();
        response.put("paymentId", createdPayment.getId());
        response.put("approvalUrl", approvalUrl);
        return response;
    }
    
    /**
     * Execute PayPal payment after user approval
     */
    public Payment executePayment(String paymentId, String payerId) throws PayPalRESTException {
        // Check if payment was already executed
        PaymentMetadata metadata = paymentMetadata.get(paymentId);
        if (metadata != null && metadata.isExecuted()) {
            throw new PayPalRESTException("Payment already executed");
        }
        
        APIContext apiContext = new APIContext(payPalConfig.getClientId(), payPalConfig.getClientSecret(), payPalConfig.getMode());
        
        Payment payment = new Payment();
        payment.setId(paymentId);
        
        PaymentExecution paymentExecution = new PaymentExecution();
        paymentExecution.setPayerId(payerId);
        
        Payment executedPayment = payment.execute(apiContext, paymentExecution);
        
        // Mark as executed
        if (metadata != null) {
            metadata.setExecuted(true);
        }
        
        return executedPayment;
    }
    
    /**
     * Get payment metadata (listingId and buyerUserId)
     */
    public PaymentMetadata getPaymentMetadata(String paymentId) {
        return paymentMetadata.get(paymentId);
    }
}
