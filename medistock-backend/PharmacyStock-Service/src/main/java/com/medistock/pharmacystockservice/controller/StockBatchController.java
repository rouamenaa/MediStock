package com.medistock.pharmacystockservice.controller;

import com.medistock.pharmacystockservice.entity.StockBatch;
import com.medistock.pharmacystockservice.service.StockBatchService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stockitems/{stockItemId}/batches")
//@CrossOrigin(
//        origins = "http://localhost:4200",
//        methods = {
//                RequestMethod.GET,
//                RequestMethod.POST,
//                RequestMethod.PUT,
//                RequestMethod.DELETE,
//                RequestMethod.OPTIONS
//        },
//        allowedHeaders = "*"
//)
public class StockBatchController {

    private final StockBatchService stockBatchService;

    public StockBatchController(StockBatchService stockBatchService) {
        this.stockBatchService = stockBatchService;
    }

    @PostMapping
    public StockBatch create(@PathVariable Long stockItemId, @RequestBody StockBatch batch) {
        return stockBatchService.createBatch(stockItemId, batch);
    }

    @GetMapping
    public List<StockBatch> getAll(@PathVariable Long stockItemId) {
        return stockBatchService.getBatchesByStockItem(stockItemId);
    }

    @PutMapping("/{batchId}")
    public StockBatch update(@PathVariable Long batchId, @RequestBody StockBatch batch) {
        return stockBatchService.updateBatch(batchId, batch);
    }

    @DeleteMapping("/{batchId}")
    public void delete(@PathVariable Long batchId) {
        stockBatchService.deleteBatch(batchId);
    }
}