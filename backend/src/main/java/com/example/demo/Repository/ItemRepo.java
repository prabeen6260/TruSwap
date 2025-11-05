package com.example.demo.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.demo.Entity.Items;
import java.util.List;

public interface ItemRepo extends MongoRepository<Items,Long>{
    List<Items> findByUserId(String userId);
}
