package com.medistock.pharmacystockservice.repository;

import com.medistock.pharmacystockservice.entity.StockItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StockItemRepository extends JpaRepository<StockItem, Long> {
    Optional<StockItem> findByPharmacyIdAndMedicationId(Long pharmacyId, Long medicationId);

    boolean existsByPharmacyIdAndMedicationId(Long pharmacyId, Long medicationId);
}
