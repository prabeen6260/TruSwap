package com.example.demo.Controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.demo.Service.GroupService;
import com.example.demo.util.JwtUtils;
import com.example.demo.Entity.Group;
import com.example.demo.dto.GroupDto;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api")
@CrossOrigin(origins = {"http://localhost:5173", "https://tru-swap.vercel.app", "https://tru-swap-git-main-prabeen6260s-projects.vercel.app"})
public class GroupController {
    private final GroupService groupService;
    
    public GroupController(GroupService groupService) {
        this.groupService = groupService;
    }
    
    // Get all groups (public)
    @GetMapping("/groups")
    public ResponseEntity<List<Group>> getAllGroups() {
        List<Group> groups = groupService.getAllGroups();
        return ResponseEntity.ok(groups);
    }
    
    // Get a single group by ID (public)
    @GetMapping("/groups/{id}")
    public ResponseEntity<Group> getGroupById(@PathVariable String id) {
        Group group = groupService.getGroupById(id);
        if (group != null) {
            return ResponseEntity.ok(group);
        }
        return ResponseEntity.notFound().build();
    }
    
    // Get groups created by the authenticated user
    @GetMapping("/groups/my-groups")
    public ResponseEntity<?> getMyGroups(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            String userId = JwtUtils.getUserId(authentication);
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Could not extract user ID from token"));
            }
            
            List<Group> groups = groupService.getGroupsByUser(userId);
            return ResponseEntity.ok(groups);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to fetch groups",
                "message", e.getMessage()
            ));
        }
    }
    
    // Create a new group (requires authentication)
    @PostMapping("/groups")
    public ResponseEntity<?> createGroup(
            @RequestBody GroupDto groupDto,
            Authentication authentication) {
        
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized", "message", "Authentication required"));
            }
            
            String userId = JwtUtils.getUserId(authentication);
            String userName = JwtUtils.getName(authentication);
            String userEmail = JwtUtils.getEmail(authentication);
            
            if (userId == null || userId.isEmpty()) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized: Invalid user ID"));
            }
            
            if (userName == null || userName.isEmpty()) {
                userName = "User";
            }
            if (userEmail == null || userEmail.isEmpty()) {
                userEmail = "";
            }
            
            Group newGroup = groupService.createGroup(groupDto, userId, userName, userEmail);
            return ResponseEntity.status(201).body(newGroup);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body(Map.of(
                "error", "Failed to create group",
                "message", e.getMessage()
            ));
        }
    }
}

