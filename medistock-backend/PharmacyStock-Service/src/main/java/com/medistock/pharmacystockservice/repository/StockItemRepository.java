package com.medistock.pharmacystockservice.repository;

import com.medistock.pharmacystockservice.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StockItemRepository extends JpaRepository<StockItem, Long> { }

