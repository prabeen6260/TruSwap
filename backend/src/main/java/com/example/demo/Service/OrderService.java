package com.example.demo.Service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;
import com.example.demo.Entity.Order;
import com.example.demo.Entity.Items;
import com.example.demo.Repository.OrderRepo;
import com.example.demo.Repository.ItemRepo;
import java.util.Optional;

@Service
public class OrderService {
    private final OrderRepo orderRepo;
    private final ItemRepo itemRepo;
    
    public OrderService(OrderRepo orderRepo, ItemRepo itemRepo) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
    }
    
    // Create an order from a completed payment
    public Order createOrder(Long listingId, String buyerEmail, String buyerName, String buyerUserId) {
        Optional<Items> itemOpt = itemRepo.findById(listingId);
        if (itemOpt.isPresent()) {
            Items item = itemOpt.get();
            
            Order order = new Order();
            order.setListingId(listingId);
            order.setItemName(item.getItemName());
            order.setItemImageUrl(item.getImageUrl());
            order.setPrice(item.getPrice());
            order.setBuyerEmail(buyerEmail);
            order.setBuyerName(buyerName);
            order.setBuyerUserId(buyerUserId);
            order.setSellerEmail(item.getEmail());
            order.setSellerName(item.getName());
            order.setStatus("completed");
            order.setPurchaseDate(LocalDateTime.now());
            
            return orderRepo.save(order);
        }
        return null;
    }
    
    // Get orders by buyer email
    public List<Order> getOrdersByBuyer(String buyerEmail) {
        return orderRepo.findByBuyerEmail(buyerEmail);
    }
    
    // Get orders by buyer user ID (Auth0 user ID)
    public List<Order> getOrdersByBuyerUserId(String buyerUserId) {
        return orderRepo.findByBuyerUserId(buyerUserId);
    }
    
    // Get all orders (for admin)
    public List<Order> getAllOrders() {
        return orderRepo.findAll();
    }
}

