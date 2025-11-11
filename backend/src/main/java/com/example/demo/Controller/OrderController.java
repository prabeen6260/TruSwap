package com.example.demo.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Service.OrderService;
import com.example.demo.util.JwtUtils;
import com.example.demo.Entity.Order;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api")
@CrossOrigin(origins = {"http://localhost:5173", "https://tru-swap.vercel.app", "https://tru-swap-git-main-prabeen6260s-projects.vercel.app"})
public class OrderController {
    private final OrderService orderService;
    
    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }
    
    // Get orders for the authenticated user
    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            String userId = JwtUtils.getUserId(authentication);
            System.out.println("Getting orders for user ID: " + userId); // Debug log
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Could not extract user ID from token"));
            }
            
            // Try to get orders by user ID first (more reliable)
            List<Order> orders = orderService.getOrdersByBuyerUserId(userId);
            
            // If no orders found by user ID, try by email as fallback
            if (orders.isEmpty()) {
                String userEmail = JwtUtils.getEmail(authentication);
                System.out.println("No orders by user ID, trying email: " + userEmail);
                if (userEmail != null && !userEmail.isEmpty()) {
                    orders = orderService.getOrdersByBuyer(userEmail);
                }
            }
            
            System.out.println("Found " + orders.size() + " orders for user: " + userId); // Debug log
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.out.println("Error in getOrders: " + e.getMessage()); // Debug log
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get sold items (orders where user is the seller)
    @GetMapping("/orders/sold")
    public ResponseEntity<?> getSoldItems(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            // Use userId instead of email for more reliable matching
            String userId = JwtUtils.getUserId(authentication);
            if (userId == null || userId.isEmpty()) {
                // Fallback to email if userId not available
                String userEmail = JwtUtils.getEmail(authentication);
                if (userEmail == null || userEmail.isEmpty()) {
                    return ResponseEntity.status(401).body(Map.of("error", "Could not extract user ID or email from token"));
                }
                List<Order> orders = orderService.getOrdersBySeller(userEmail);
                return ResponseEntity.ok(orders);
            }
            
            // Use userId to find orders - get all listings owned by user, then find orders for those listings
            List<Order> orders = orderService.getOrdersBySellerUserId(userId);
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            System.out.println("Error in getSoldItems: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
    
    // Get all orders (for admin - optional)
    @GetMapping("/orders/all")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.getAllOrders();
        return ResponseEntity.ok(orders);
    }
}

