package com.medistock.pharmacystockservice.service;


import com.medistock.pharmacystockservice.entity.StockBatch;
import com.medistock.pharmacystockservice.entity.StockItem;
import com.medistock.pharmacystockservice.repository.StockBatchRepository;
import com.medistock.pharmacystockservice.repository.StockItemRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class StockBatchService {

    private final StockBatchRepository stockBatchRepository;
    private final StockItemRepository stockItemRepository;
    private final StockItemService stockItemService;

    public StockBatchService(StockBatchRepository stockBatchRepository,
                             StockItemRepository stockItemRepository,
                             StockItemService stockItemService) {
        this.stockBatchRepository = stockBatchRepository;
        this.stockItemRepository = stockItemRepository;
        this.stockItemService = stockItemService;
    }

    // CRUD StockBatch
    public StockBatch createBatch(Long stockItemId, StockBatch batch) {
        StockItem item = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StockItem not found"));

        batch.setStockItem(item);
        batch.setCreatedAt(LocalDateTime.now());
        StockBatch saved = stockBatchRepository.save(batch);

        // Mise à jour StockItem.totalQuantity
        item.setTotalQuantity(item.getTotalQuantity() + batch.getRemainingQuantity());
        item.setLastUpdated(LocalDateTime.now());
        stockItemRepository.save(item);

        // Ajouter mouvement automatique
        stockItemService.addMovement(item.getId(), "ADD", batch.getRemainingQuantity(), "Batch " + batch.getBatchNumber());

        return saved;
    }

    public List<StockBatch> getBatchesByStockItem(Long stockItemId) {
        StockItem item = stockItemRepository.findById(stockItemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StockItem not found"));
        return stockBatchRepository.findByStockItemOrderByExpirationDateAsc(item);
    }

    @Transactional
    public StockBatch updateBatch(Long batchId, StockBatch updatedBatch) {
        StockBatch batch = stockBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));

        int oldQuantity = batch.getRemainingQuantity();

        batch.setBatchNumber(updatedBatch.getBatchNumber());
        batch.setExpirationDate(updatedBatch.getExpirationDate());
        batch.setRemainingQuantity(updatedBatch.getRemainingQuantity());

        stockBatchRepository.save(batch);

        // Mettre à jour StockItem.totalQuantity si la quantité change
        StockItem item = batch.getStockItem();
        item.setTotalQuantity(item.getTotalQuantity() - oldQuantity + batch.getRemainingQuantity());
        item.setLastUpdated(LocalDateTime.now());
        stockItemRepository.save(item);

        // Ajouter mouvement automatique
        int diff = batch.getRemainingQuantity() - oldQuantity;
        if(diff != 0) {
            String type = diff > 0 ? "ADD" : "REMOVE";
            stockItemService.addMovement(item.getId(), type, Math.abs(diff), "Batch update " + batch.getBatchNumber());
        }

        return batch;
    }

    @Transactional
    public void deleteBatch(Long batchId) {
        StockBatch batch = stockBatchRepository.findById(batchId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Batch not found"));

        StockItem item = batch.getStockItem();

        // Déduire du totalQuantity
        item.setTotalQuantity(item.getTotalQuantity() - batch.getRemainingQuantity());
        item.setLastUpdated(LocalDateTime.now());
        stockItemRepository.save(item);

        // Ajouter mouvement automatique
        stockItemService.addMovement(item.getId(), "REMOVE", batch.getRemainingQuantity(), "Batch deleted " + batch.getBatchNumber());

        stockBatchRepository.delete(batch);
    }

}
