package com.medistock.pharmacystockservice.service;

import com.medistock.pharmacystockservice.client.MedicationCatalogClient;
import com.medistock.pharmacystockservice.client.PharmacyManagementClient;
import com.medistock.pharmacystockservice.dto.LowStockAlertEventDto;
import com.medistock.pharmacystockservice.dto.MedicationCatalogDto;
import com.medistock.pharmacystockservice.entity.StockItem;
import com.medistock.pharmacystockservice.entity.StockBatch;
import com.medistock.pharmacystockservice.entity.StockMovement;
import feign.FeignException;
import com.medistock.pharmacystockservice.messaging.LowStockAlertProducer;
import com.medistock.pharmacystockservice.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class StockItemService {

    private final StockItemRepository stockItemRepository;
    private final StockBatchRepository stockBatchRepository;
    private final StockMovementRepository stockMovementRepository;
    private final LowStockAlertProducer lowStockAlertProducer;
    private final DocumentCatalogPublisher documentCatalogPublisher;
    private final MedicationCatalogClient medicationCatalogClient;
    private final PharmacyManagementClient pharmacyManagementClient;

    public StockItemService(StockItemRepository stockItemRepository,
            StockBatchRepository stockBatchRepository,
            StockMovementRepository stockMovementRepository,
            LowStockAlertProducer lowStockAlertProducer,
            DocumentCatalogPublisher documentCatalogPublisher,
            MedicationCatalogClient medicationCatalogClient,
            PharmacyManagementClient pharmacyManagementClient) {
        this.stockItemRepository = stockItemRepository;
        this.stockBatchRepository = stockBatchRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.lowStockAlertProducer = lowStockAlertProducer;
        this.documentCatalogPublisher = documentCatalogPublisher;
        this.medicationCatalogClient = medicationCatalogClient;
        this.pharmacyManagementClient = pharmacyManagementClient;
    }

    public StockItem createStockItem(StockItem item) {
        validateStockItemReferences(item);
        if (stockItemRepository.existsByPharmacyIdAndMedicationId(item.getPharmacyId(), item.getMedicationId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "StockItem already exists for this pharmacy and medication");
        }
        item.setLastUpdated(LocalDateTime.now());
        item.setStatus("ACTIVE");
        return stockItemRepository.save(item);
    }

    public StockItem getStockItem(Long id) {
        return stockItemRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "StockItem not found"));
    }

    public List<StockItem> getAllStockItems() {
        return stockItemRepository.findAll();
    }

    public StockItem updateStockItem(Long id, int lowStockThreshold) {
        StockItem item = getStockItem(id);
        item.setLowStockThreshold(lowStockThreshold);
        item.setLastUpdated(LocalDateTime.now());
        return stockItemRepository.save(item);
    }

    public void deleteStockItem(Long id) {
        StockItem item = getStockItem(id);
        stockItemRepository.delete(item);
    }

    public int getAvailableQuantity(Long pharmacyId, Long medicationId) {
        return stockItemRepository.findByPharmacyIdAndMedicationId(pharmacyId, medicationId)
                .map(this::computeAvailableQuantity)
                .orElse(0);
    }

    @Transactional
    public void consumeByPharmacyAndMedication(Long pharmacyId, Long medicationId, int quantity, String reference) {
        StockItem item = stockItemRepository.findByPharmacyIdAndMedicationId(pharmacyId, medicationId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "StockItem not found for pharmacyId=" + pharmacyId + " medicationId=" + medicationId));
        consumeStock(item, quantity, reference);
    }

    // Ajouter un mouvement automatiquement
    @Transactional
    public void addMovement(Long stockItemId, String type, int quantity, String reference) {
        StockMovement movement = new StockMovement();
        movement.setStockItemId(stockItemId);
        movement.setType(type);
        movement.setQuantityChanged(quantity);
        movement.setTimestamp(LocalDateTime.now());
        movement.setReference(reference);
        stockMovementRepository.save(movement);
    }

    // Consommer stock FIFO
    // Consommer stock FIFO (sans les batches expirés)
    @Transactional
    public void consumeStock(StockItem item, int quantity, String reference) {
        LocalDate today = LocalDate.now();

        // Filtrer les batches non expirés seulement
        List<StockBatch> batches = stockBatchRepository
                .findByStockItemOrderByExpirationDateAsc(item)
                .stream()
                .filter(b -> b.getExpirationDate() != null && !b.getExpirationDate().isBefore(today))
                .collect(Collectors.toList());

        // Calculer le stock réellement disponible (non expiré, non réservé)
        int availableNonExpired = batches.stream()
                .mapToInt(StockBatch::getRemainingQuantity)
                .sum() - item.getReservedQuantity();

        if (quantity > availableNonExpired)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Not enough non-expired stock available");

        int remaining = quantity;
        for (StockBatch batch : batches) {
            if (remaining <= 0)
                break;

            if (batch.getRemainingQuantity() >= remaining) {
                batch.setRemainingQuantity(batch.getRemainingQuantity() - remaining);
                stockBatchRepository.save(batch);
                remaining = 0;
            } else {
                remaining -= batch.getRemainingQuantity();
                batch.setRemainingQuantity(0);
                stockBatchRepository.save(batch);
            }
        }

        item.setTotalQuantity(item.getTotalQuantity() - quantity);
        item.setLastUpdated(LocalDateTime.now());
        stockItemRepository.save(item);

        addMovement(item.getId(), "CONSUME", quantity, reference);
        publishLowStockIfNeeded(item);
    }

    private void validateStockItemReferences(StockItem item) {
        if (item == null || item.getPharmacyId() == null || item.getMedicationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "pharmacyId and medicationId are required");
        }
        try {
            MedicationCatalogDto medication = medicationCatalogClient.getMedicationById(item.getMedicationId());
            if (medication == null || medication.getId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unknown medicationId: " + item.getMedicationId());
            }
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown medicationId: " + item.getMedicationId());
        }
        try {
            pharmacyManagementClient.getPharmacyById(item.getPharmacyId());
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown pharmacyId: " + item.getPharmacyId());
        }
    }

    private int computeAvailableQuantity(StockItem item) {
        return Math.max(item.getTotalQuantity() - item.getReservedQuantity(), 0);
    }

    private void publishLowStockIfNeeded(StockItem item) {
        int available = computeAvailableQuantity(item);
        if (available <= item.getLowStockThreshold()) {
            LowStockAlertEventDto event = new LowStockAlertEventDto();
            event.setPharmacyId(item.getPharmacyId());
            event.setMedicationId(item.getMedicationId());
            event.setRemainingQuantity(available);
            event.setThreshold(item.getLowStockThreshold());
            lowStockAlertProducer.publish(event);
            documentCatalogPublisher.publishLowStockReport(event);
        }
    }
}
