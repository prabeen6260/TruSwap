package com.example.demo.Repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.demo.Entity.Group;
import java.util.List;

public interface GroupRepo extends MongoRepository<Group, String> {
    List<Group> findByCreatedBy(String createdBy);
}

