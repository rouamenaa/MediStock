package com.medistock.pharmacystockservice.controller;

import com.medistock.pharmacystockservice.entity.StockMovement;
import com.medistock.pharmacystockservice.service.StockMovementService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stock")
@CrossOrigin(origins = "http://localhost:4200")

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