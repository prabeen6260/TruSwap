package com.example.demo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;

@Data
@Document(collection = "orders")
public class Order {
    @Id
    private String id;
    private Long listingId;
    private String itemName;
    private String itemImageUrl;
    private Integer price;
    private String buyerEmail;
    private String buyerName;
    private String buyerUserId; // Store Auth0 user ID for lookup
    private String sellerEmail;
    private String sellerName;
    private String status; // "completed", "pending", "cancelled"
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime purchaseDate;
    
    // Manual getter/setter for purchaseDate (Lombok workaround)
    public LocalDateTime getPurchaseDate() {
        return purchaseDate;
    }
    
    public void setPurchaseDate(LocalDateTime purchaseDate) {
        this.purchaseDate = purchaseDate;
    }
}

