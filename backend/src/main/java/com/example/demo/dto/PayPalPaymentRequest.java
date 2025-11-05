package com.example.demo.dto;

import lombok.Data;

@Data
public class PayPalPaymentRequest {
    private Long listingId;
    private Integer price;
    private String itemName;
    private String buyerEmail;
    private String buyerName;
    private String buyerUserId; // Auth0 user ID
    private String successUrl;
    private String cancelUrl;
}

