package com.example.demo.Service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.time.LocalDateTime;
import com.example.demo.Entity.Group;
import com.example.demo.Repository.GroupRepo;
import com.example.demo.dto.GroupDto;

@Service
public class GroupService {
    private final GroupRepo groupRepo;
    
    public GroupService(GroupRepo groupRepo) {
        this.groupRepo = groupRepo;
    }
    
    // Get all groups
    public List<Group> getAllGroups() {
        return groupRepo.findAll();
    }
    
    // Get groups created by a user
    public List<Group> getGroupsByUser(String userId) {
        return groupRepo.findByCreatedBy(userId);
    }
    
    // Get a single group by ID
    public Group getGroupById(String id) {
        return groupRepo.findById(id).orElse(null);
    }
    
    // Create a new group
    public Group createGroup(GroupDto groupDto, String userId, String userName, String userEmail) {
        Group newGroup = new Group();
        newGroup.setName(groupDto.getName());
        newGroup.setDescription(groupDto.getDescription());
        newGroup.setCreatedBy(userId);
        newGroup.setCreatorName(userName);
        newGroup.setCreatorEmail(userEmail);
        newGroup.setCreatedAt(LocalDateTime.now());
        return groupRepo.save(newGroup);
    }
}

