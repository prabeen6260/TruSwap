package com.example.demo.Service;

import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import com.example.demo.Entity.Items;
import com.example.demo.Repository.ItemRepo;
import com.example.demo.dto.ItemsDto;

@Service
public class ItemService {
    private final ItemRepo itemRepo;
    
    public ItemService(ItemRepo itemRepo) {
        this.itemRepo = itemRepo;
    }

    // Get all items (for public browsing) - exclude sold items
    public List<Items> getAllItems() {
        List<Items> allItems = itemRepo.findAll();
        // Filter out sold items
        return allItems.stream()
            .filter(item -> !item.getIsSold())
            .toList();
    }

    // Get items by user ID (for user's own listings)
    public List<Items> getItems(String userId) {
        return itemRepo.findByUserId(userId);
    }

    // Get a single item by ID
    public Optional<Items> getItemById(Long id) {
        return itemRepo.findById(id);
    }

    public Items createListing(ItemsDto itemsDto, String userId){
        Items newItem = new Items();
        newItem.setItemName(itemsDto.getItemName());
        newItem.setCategory(itemsDto.getCategory());
        newItem.setPrice(itemsDto.getPrice());
        newItem.setDescription(itemsDto.getDescription());
        newItem.setCondition(itemsDto.getCondition());
        newItem.setImageUrl(itemsDto.getImageUrl());
        newItem.setName(itemsDto.getName());
        newItem.setEmail(itemsDto.getEmail());
        newItem.setUserId(userId);
        newItem.setGroupId(itemsDto.getGroupId()); // Set group ID if provided
        newItem.setListingType(itemsDto.getListingType() != null && !itemsDto.getListingType().isEmpty() 
            ? itemsDto.getListingType() : "sell"); // Default to "sell" if not provided
        newItem.setDatePosted(LocalDateTime.now());
        newItem.setIsSold(false);
        return itemRepo.save(newItem);
    }
    
    // Mark an item as sold
    public boolean markItemAsSold(Long itemId) {
        System.out.println("Attempting to mark item as sold, ID: " + itemId);
        Optional<Items> itemOpt = itemRepo.findById(itemId);
        if (itemOpt.isPresent()) {
            Items item = itemOpt.get();
            System.out.println("Found item: " + item.getItemName() + ", current isSold: " + item.getIsSold());
            item.setIsSold(true);
            Items saved = itemRepo.save(item);
            System.out.println("Item saved, new isSold: " + saved.getIsSold());
            return true;
        } else {
            System.out.println("Item not found with ID: " + itemId);
            // Try to find by usserId (MongoDB _id field)
            List<Items> allItems = itemRepo.findAll();
            System.out.println("Total items in database: " + allItems.size());
            for (Items item : allItems) {
                System.out.println("Item ID: " + item.getUsserId() + ", Name: " + item.getItemName());
            }
        }
        return false;
    }
}
