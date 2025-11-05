package com.example.demo.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.demo.Entity.Order;
import java.util.List;

public interface OrderRepo extends MongoRepository<Order, String> {
    List<Order> findByBuyerEmail(String buyerEmail);
    List<Order> findByBuyerUserId(String buyerUserId);
    List<Order> findBySellerEmail(String sellerEmail);
}

