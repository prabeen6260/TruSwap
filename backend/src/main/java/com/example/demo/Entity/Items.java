package com.example.demo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Document(collection = "items")
public class Items {
    @Id
    @JsonProperty("id")
    private long usserId;
    private String itemName;
    private String category;
    private int price;
    private String description;
    private String condition;
    private String imageUrl;
    private String name;
    private String email;
    private String userId;
    private String groupId; // Optional: ID of the group this item belongs to
    private String listingType = "sell"; // "sell" or "rent" - default to "sell"
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime datePosted;
    
    private Boolean isSold = false; // Default to false for new listings
    
    // Manual getter/setter for datePosted (Lombok workaround)
    public LocalDateTime getDatePosted() {
        return datePosted;
    }
    
    public void setDatePosted(LocalDateTime datePosted) {
        this.datePosted = datePosted;
    }
    
    // Manual getter/setter for isSold (Lombok workaround)
    public Boolean getIsSold() {
        return isSold != null ? isSold : false;
    }
    
    public void setIsSold(Boolean isSold) {
        this.isSold = isSold != null ? isSold : false;
    }

}
