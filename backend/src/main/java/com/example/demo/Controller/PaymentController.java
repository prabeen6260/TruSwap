package com.example.demo.Controller;

import com.example.demo.Service.ItemService;
import com.example.demo.Service.PaymentService;
import com.example.demo.Service.OrderService;
import com.example.demo.dto.PayPalPaymentRequest;
import com.example.demo.Entity.Order;
import com.example.demo.config.PayPalConfig;
import com.paypal.api.payments.Payment;
import com.paypal.base.rest.APIContext;
import com.paypal.base.rest.PayPalRESTException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import com.example.demo.util.JwtUtils;

import java.util.Map;
import java.util.List;

@RestController
@RequestMapping("api")
@CrossOrigin(origins = {"http://localhost:5173", "https://tru-swap.vercel.app", "https://tru-swap-git-main-prabeen6260s-projects.vercel.app"})
public class PaymentController {
    
    private final PaymentService paymentService;
    private final ItemService itemService;
    private final OrderService orderService;
    
    @Autowired
    private PayPalConfig payPalConfig;
    
    public PaymentController(PaymentService paymentService, ItemService itemService, OrderService orderService) {
        this.paymentService = paymentService;
        this.itemService = itemService;
        this.orderService = orderService;
    }
    
    // Create PayPal payment
    @PostMapping("/payments/create-payment")
    public ResponseEntity<?> createPayment(@RequestBody PayPalPaymentRequest request, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            // Validate listingId
            if (request.getListingId() == null || request.getListingId() == 0) {
                System.out.println("Invalid listingId in createPayment request: " + request.getListingId());
                return ResponseEntity.status(400).body(Map.of("error", "Invalid listingId", "message", "listingId must be provided and non-zero"));
            }
            
            System.out.println("Creating payment for listingId: " + request.getListingId() + ", buyerUserId: " + request.getBuyerUserId());
            
            // Get buyer info from request or JWT token
            String buyerEmail = request.getBuyerEmail();
            String buyerName = request.getBuyerName();
            
            if (buyerEmail == null || buyerEmail.isEmpty()) {
                buyerEmail = JwtUtils.getEmail(authentication);
            }
            if (buyerName == null || buyerName.isEmpty()) {
                buyerName = JwtUtils.getName(authentication);
            }
            
            if (buyerEmail == null || buyerEmail.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Could not determine user email"));
            }
            if (buyerName == null || buyerName.isEmpty()) {
                buyerName = "Buyer";
            }
            
            request.setBuyerEmail(buyerEmail);
            request.setBuyerName(buyerName);
            
            // Create PayPal payment
            Map<String, String> response = paymentService.createPayment(request);
            System.out.println("Payment created successfully, paymentId: " + response.get("paymentId"));
            return ResponseEntity.ok(response);
        } catch (PayPalRESTException e) {
            System.out.println("PayPal error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "PayPal payment creation failed", "message", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Error creating payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Execute PayPal payment (called after user approves on PayPal)
    @PostMapping("/payments/execute")
    public ResponseEntity<?> executePayment(@RequestBody Map<String, String> request) {
        try {
            String paymentId = request.get("paymentId");
            String payerId = request.get("payerId");
            String listingIdStr = request.get("listingId");
            String buyerUserId = request.get("buyerUserId");
            
            System.out.println("Executing payment - paymentId: " + paymentId + ", payerId: " + payerId + ", listingId: " + listingIdStr + ", buyerUserId: " + buyerUserId);
            
            if (paymentId == null || payerId == null) {
                return ResponseEntity.status(400).body(Map.of("error", "Missing required parameters: paymentId and payerId"));
            }
            
            // Try to get listingId and buyerUserId from stored metadata if not provided
            PaymentService.PaymentMetadata metadata = paymentService.getPaymentMetadata(paymentId);
            System.out.println("Metadata lookup for paymentId " + paymentId + ": " + (metadata != null ? "found" : "not found"));
            
            if (metadata != null) {
                if (listingIdStr == null || listingIdStr.isEmpty() || "0".equals(listingIdStr)) {
                    listingIdStr = metadata.getListingId().toString();
                    System.out.println("Using listingId from metadata: " + listingIdStr);
                }
                if (buyerUserId == null || buyerUserId.isEmpty()) {
                    buyerUserId = metadata.getBuyerUserId();
                    System.out.println("Using buyerUserId from metadata: " + buyerUserId);
                }
            } else {
                System.out.println("No metadata found for paymentId: " + paymentId);
            }
            
            // Final validation - if still invalid, return error
            if (listingIdStr == null || listingIdStr.isEmpty() || "0".equals(listingIdStr)) {
                System.out.println("Invalid listingId after metadata lookup: " + listingIdStr);
                return ResponseEntity.status(400).body(Map.of(
                    "error", "Invalid listingId", 
                    "details", "listingId from request: " + request.get("listingId") + ", metadata: " + (metadata != null ? metadata.getListingId() : "null")
                ));
            }
            
            // Execute payment
            Payment payment = null;
            boolean paymentAlreadyDone = false;
            
            try {
                payment = paymentService.executePayment(paymentId, payerId);
                System.out.println("Payment state: " + payment.getState());
            } catch (PayPalRESTException e) {
                // Check if payment was already executed
                if (e.getMessage() != null && (e.getMessage().contains("PAYMENT_ALREADY_DONE") || 
                    e.getMessage().contains("Payment already executed"))) {
                    System.out.println("Payment already executed, fetching payment details...");
                    paymentAlreadyDone = true;
                    // Try to get payment details to verify it was approved
                    try {
                        APIContext apiContext = new APIContext(payPalConfig.getClientId(), payPalConfig.getClientSecret(), payPalConfig.getMode());
                        payment = Payment.get(apiContext, paymentId);
                        System.out.println("Retrieved payment state: " + payment.getState());
                    } catch (Exception ex) {
                        System.out.println("Could not retrieve payment: " + ex.getMessage());
                        return ResponseEntity.status(400).body(Map.of("error", "Payment already executed but could not verify"));
                    }
                } else {
                    throw e; // Re-throw if it's a different error
                }
            }
            
            if (payment != null && (payment.getState().equals("approved") || paymentAlreadyDone)) {
                Long listingId = Long.parseLong(listingIdStr);
                
                System.out.println("Payment approved for listing: " + listingId);
                
                // Check if order already exists for this payment (prevent duplicates)
                boolean orderExists = false;
                if (buyerUserId != null && !buyerUserId.isEmpty()) {
                    List<Order> existingOrders = orderService.getOrdersByBuyerUserId(buyerUserId);
                    orderExists = existingOrders.stream().anyMatch(o -> o.getListingId().equals(listingId));
                }
                
                if (orderExists) {
                    System.out.println("Order already exists for this payment");
                    return ResponseEntity.ok(Map.of(
                        "status", "success",
                        "message", "Payment already processed",
                        "alreadyProcessed", true
                    ));
                }
                
                // Mark item as sold (even if already sold, this is idempotent)
                boolean success = itemService.markItemAsSold(listingId);
                System.out.println("Item marked as sold: " + success);
                
                if (success) {
                    // Get buyer info from payment
                    String buyerEmail = payment.getPayer().getPayerInfo().getEmail();
                    String firstName = payment.getPayer().getPayerInfo().getFirstName();
                    String lastName = payment.getPayer().getPayerInfo().getLastName();
                    String buyerName = (firstName != null ? firstName : "") + " " + (lastName != null ? lastName : "").trim();
                    if (buyerName.isEmpty()) {
                        buyerName = "Buyer";
                    }
                    
                    System.out.println("Creating order for buyer: " + buyerEmail + " (" + buyerName + "), userId: " + buyerUserId);
                    
                    // Use buyerUserId from request, or fallback to "unknown"
                    if (buyerUserId == null || buyerUserId.isEmpty()) {
                        buyerUserId = "unknown";
                    }
                    
                    // Create order
                    Order order = orderService.createOrder(listingId, buyerEmail, buyerName, buyerUserId);
                    
                    if (order != null) {
                        System.out.println("Order created successfully: " + order.getId());
                        return ResponseEntity.ok(Map.of(
                            "status", "success",
                            "message", paymentAlreadyDone ? "Payment was already completed, order created" : "Payment completed successfully",
                            "orderId", order.getId(),
                            "buyerEmail", buyerEmail
                        ));
                    } else {
                        System.out.println("Failed to create order - item not found");
                        return ResponseEntity.status(404).body(Map.of("error", "Listing not found"));
                    }
                } else {
                    System.out.println("Failed to mark item as sold - listing not found");
                    return ResponseEntity.status(404).body(Map.of("error", "Listing not found"));
                }
            } else {
                System.out.println("Payment not approved, state: " + (payment != null ? payment.getState() : "null"));
                return ResponseEntity.status(400).body(Map.of("error", "Payment not approved", "state", payment != null ? payment.getState() : "null"));
            }
        } catch (PayPalRESTException e) {
            System.out.println("PayPal execution error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", "Payment execution failed", "message", e.getMessage()));
        } catch (Exception e) {
            System.out.println("Error executing payment: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
