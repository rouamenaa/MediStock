package com.medistock.pharmacystockservice.service;


import com.medistock.pharmacystockservice.entity.StockItem;
import com.medistock.pharmacystockservice.entity.StockBatch;
import com.medistock.pharmacystockservice.entity.StockMovement;
import com.medistock.pharmacystockservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockItemService {

    private final StockItemRepository stockItemRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockMovementRepository stockMovementRepository;

    public StockItemService(StockItemRepository stockItemRepository,
                            StockBatchRepository stockBatchRepository,
                            StockMovementRepository stockMovementRepository) {
        this.stockItemRepository = stockItemRepository;
        this.stockBatchRepository = stockBatchRepository;
        this.stockMovementRepository = stockMovementRepository;
    }

    // CRUD StockItem
    public StockItem createStockItem(StockItem item) {
        item.setLastUpdated(LocalDateTime.now());
        item.setStatus("ACTIVE");
        return stockItemRepository.save(item);
    }

    public StockItem getStockItem(Long id) {
        return stockItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StockItem not found"));
    }

    public StockItem updateStockItem(Long id, int lowStockThreshold) {
        StockItem item = getStockItem(id);
        item.setLowStockThreshold(lowStockThreshold);
        item.setLastUpdated(LocalDateTime.now());
        return stockItemRepository.save(item);
    }

    public void deleteStockItem(Long id) {
        StockItem item = getStockItem(id);
        stockItemRepository.delete(item);
    }

    // Ajouter un mouvement automatiquement
    @Transactional
    public void addMovement(Long stockItemId, String type, int quantity, String reference) {
        StockMovement movement = new StockMovement();
        movement.setStockItemId(stockItemId);
        movement.setType(type);
        movement.setQuantityChanged(quantity);
        movement.setTimestamp(LocalDateTime.now());
        movement.setReference(reference);
        stockMovementRepository.save(movement);
    }

    // Consommer stock FIFO
    @Transactional
    public void consumeStock(StockItem item, int quantity, String reference) {
        int available = item.getTotalQuantity() - item.getReservedQuantity();
        if(quantity > available)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Not enough stock available");

        List<StockBatch> batches = stockBatchRepository.findByStockItemOrderByExpirationDateAsc(item);
        int remaining = quantity;
        for(StockBatch batch : batches) {
            if(batch.getRemainingQuantity() >= remaining) {
                batch.setRemainingQuantity(batch.getRemainingQuantity() - remaining);
                stockBatchRepository.save(batch);
                break;
            } else {
                remaining -= batch.getRemainingQuantity();
                batch.setRemainingQuantity(0);
                stockBatchRepository.save(batch);
            }
        }

        item.setTotalQuantity(item.getTotalQuantity() - quantity);
        item.setLastUpdated(LocalDateTime.now());
        stockItemRepository.save(item);

        addMovement(item.getId(), "CONSUME", quantity, reference);
    }
}
