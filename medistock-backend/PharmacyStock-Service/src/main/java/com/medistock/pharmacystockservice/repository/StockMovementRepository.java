package com.medistock.pharmacystockservice.repository;

import com.medistock.pharmacystockservice.entity.StockMovement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StockMovementRepository extends JpaRepository<StockMovement, Long> {
    List<StockMovement> findByStockItemIdOrderByCreatedAtAsc(Long stockItemId);
}
