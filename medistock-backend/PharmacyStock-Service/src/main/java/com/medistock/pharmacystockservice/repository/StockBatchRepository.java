package com.medistock.pharmacystockservice.repository;

import com.medistock.pharmacystockservice.entity.StockBatch;
import com.medistock.pharmacystockservice.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockBatchRepository extends JpaRepository<StockBatch, Long> {
    List<StockBatch> findByStockItemOrderByExpirationDateAsc(StockItem stockItem);
}
