package com.example.demo.dto;

import lombok.Data;

@Data
public class ItemsDto {
    private String itemName;
    private String category;
    private int price;
    private String description;
    private String condition;
    private String imageUrl;
    private String name;
    private String email;
    private String groupId; // Optional: ID of the group this item belongs to
    private String listingType; // "sell" or "rent"
}
