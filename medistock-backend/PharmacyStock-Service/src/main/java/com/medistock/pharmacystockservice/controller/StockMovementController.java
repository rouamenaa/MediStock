package com.medistock.pharmacystockservice.controller;

import com.medistock.pharmacystockservice.entity.StockMovement;
import com.medistock.pharmacystockservice.service.StockMovementService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
public class StockMovementController {

    private final StockMovementService stockMovementService;

    public StockMovementController(StockMovementService stockMovementService) {
        this.stockMovementService = stockMovementService;
    }

    @GetMapping("/movements/{stockItemId}")
    public List<StockMovement> getMovements(@PathVariable Long stockItemId) {
        return stockMovementService.getMovementsByStockItem(stockItemId);
    }
}