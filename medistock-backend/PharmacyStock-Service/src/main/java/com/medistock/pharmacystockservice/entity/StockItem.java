package com.medistock.pharmacystockservice.entity;


import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "stock_items")
public class StockItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long pharmacyId;     // Référence externe
    private Long medicationId;   // Référence externe

    private int totalQuantity;
    private int reservedQuantity;
    private int lowStockThreshold;

    private String status;       // ACTIVE / OUT_OF_STOCK

    private LocalDateTime lastUpdated;

    @Version
    private int version;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getPharmacyId() { return pharmacyId; }
    public void setPharmacyId(Long pharmacyId) { this.pharmacyId = pharmacyId; }
    public Long getMedicationId() { return medicationId; }
    public void setMedicationId(Long medicationId) { this.medicationId = medicationId; }
    public int getTotalQuantity() { return totalQuantity; }
    public void setTotalQuantity(int totalQuantity) { this.totalQuantity = totalQuantity; }
    public int getReservedQuantity() { return reservedQuantity; }
    public void setReservedQuantity(int reservedQuantity) { this.reservedQuantity = reservedQuantity; }
    public int getLowStockThreshold() { return lowStockThreshold; }
    public void setLowStockThreshold(int lowStockThreshold) { this.lowStockThreshold = lowStockThreshold; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDateTime getLastUpdated() { return lastUpdated; }
    public void setLastUpdated(LocalDateTime lastUpdated) { this.lastUpdated = lastUpdated; }
    public int getVersion() { return version; }
    public void setVersion(int version) { this.version = version; }
}
