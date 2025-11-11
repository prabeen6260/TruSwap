package com.example.demo.Controller;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Entity.Items;
import com.example.demo.Service.ItemService;
import com.example.demo.dto.ItemsDto;
import com.example.demo.util.JwtUtils;

@RequestMapping
@RestController
@CrossOrigin(origins = {"http://localhost:5173", "https://tru-swap.vercel.app", "https://tru-swap-git-main-prabeen6260s-projects.vercel.app"})
public class ItemsController {
    private final ItemService itemService;
    
    public ItemsController(ItemService itemService) {
        this.itemService = itemService;
    }
    
    // Get all listings (public, no auth required)
    @GetMapping("api/listings")
    public ResponseEntity<List<Items>> getAllListings() {
        List<Items> items = itemService.getAllItems();
        return ResponseEntity.ok(items);
    }
    
    // Get a single listing by ID
    @GetMapping("api/listings/{id}")
    public ResponseEntity<Items> getListingById(@PathVariable Long id) {
        Optional<Items> item = itemService.getItemById(id);
        if (item.isPresent()) {
            return ResponseEntity.ok(item.get());
        }
        return ResponseEntity.notFound().build();
    }

    // Create a new listing (requires authentication)
    // User ID is extracted from Auth0 JWT token
    @PostMapping("api/createListing")
    public ResponseEntity<?> createListings(
            @RequestBody ItemsDto itemsDto,
            Authentication authentication) {
        
        try {
            // Extract user ID from JWT token
            String userId = JwtUtils.getUserId(authentication);
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Invalid user ID"));
            }
            
            // Optionally, you can also update name/email from token if they're not in DTO
            // String email = JwtUtils.getEmail(authentication);
            // String name = JwtUtils.getName(authentication);
            
            Items newItem = itemService.createListing(itemsDto, userId);
            return ResponseEntity.status(201).body(newItem);
        } catch (Exception e) {
            e.printStackTrace(); // Log the error
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to create listing",
                "message", e.getMessage()
            ));
        }
    }
    
    // Get user's own listings (requires authentication)
    @GetMapping("api/my-listings")
    public ResponseEntity<?> getMyListings(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            String userId = JwtUtils.getUserId(authentication);
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Could not extract user ID from token"));
            }
            
            List<Items> items = itemService.getItems(userId);
            return ResponseEntity.ok(items);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to fetch listings",
                "message", e.getMessage()
            ));
        }
    }
}
