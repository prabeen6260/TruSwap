package com.example.demo.Entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.time.LocalDateTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
@Document(collection = "groups")
public class Group {
    @Id
    @JsonProperty("id")
    private String id;
    private String name;
    private String description;
    private String createdBy; // Auth0 user ID of creator
    private String creatorName; // Name of creator
    private String creatorEmail; // Email of creator
    
    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;
    
    // Manual getter/setter for createdAt (Lombok workaround)
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

