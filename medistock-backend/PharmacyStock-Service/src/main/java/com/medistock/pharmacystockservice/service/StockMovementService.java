package com.medistock.pharmacystockservice.service;

import com.medistock.pharmacystockservice.entity.StockMovement;
import com.medistock.pharmacystockservice.repository.StockMovementRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StockMovementService {

    private final StockMovementRepository stockMovementRepository;

    public StockMovementService(StockMovementRepository stockMovementRepository) {
        this.stockMovementRepository = stockMovementRepository;
    }

    public List<StockMovement> getMovementsByStockItem(Long stockItemId) {
        return stockMovementRepository
                .findByStockItemIdOrderByCreatedAtAsc(stockItemId);
    }
}
