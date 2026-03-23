package com.medistock.pharmacystockservice.controller;


import com.medistock.pharmacystockservice.entity.StockItem;
import com.medistock.pharmacystockservice.service.StockItemService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stockitems")
public class StockItemController {

    private final StockItemService stockItemService;

    public StockItemController(StockItemService stockItemService) {
        this.stockItemService = stockItemService;
    }

    @PostMapping
    public StockItem create(@RequestBody StockItem item) {
        return stockItemService.createStockItem(item);
    }

    @GetMapping("/{id}")
    public StockItem get(@PathVariable Long id) {
        return stockItemService.getStockItem(id);
    }

    @PutMapping("/{id}")
    public StockItem update(@PathVariable Long id, @RequestParam int lowStockThreshold) {
        return stockItemService.updateStockItem(id, lowStockThreshold);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        stockItemService.deleteStockItem(id);
    }
    @PostMapping("/{id}/consume")
    public void consume(@PathVariable Long id,
                        @RequestParam int quantity,
                        @RequestParam String reference) {
        StockItem item = stockItemService.getStockItem(id);
        stockItemService.consumeStock(item, quantity, reference);
    }
}
