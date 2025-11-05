package com.example.demo.config;

import java.time.Instant;

import org.springframework.data.mongodb.core.mapping.event.AbstractMongoEventListener;
import org.springframework.data.mongodb.core.mapping.event.BeforeConvertEvent;
import org.springframework.stereotype.Component;

import com.example.demo.Entity.Items;
import com.example.demo.Repository.ItemRepo;

/**
 * Ensures each listing has a unique Mongo identifier before persisting.
 * The original Items entity uses a primitive long @Id (usserId) which defaults to 0,
 * so we assign a unique value when the entity is first saved.
 */
@Component
public class ListingIdGeneratorListener extends AbstractMongoEventListener<Items> {

  private final ItemRepo itemRepo;

  public ListingIdGeneratorListener(ItemRepo itemRepo) {
    this.itemRepo = itemRepo;
  }

  @Override
  public void onBeforeConvert(BeforeConvertEvent<Items> event) {
    Items item = event.getSource();
    if (item == null) {
      return;
    }

    if (item.getUsserId() == 0L) {
      item.setUsserId(generateUniqueId());
    }
  }

  private long generateUniqueId() {
    long candidate = Instant.now().toEpochMilli();
    while (itemRepo.existsById(candidate)) {
      candidate++;
    }
    return candidate;
  }
}

