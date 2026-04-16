package com.medistock.catalog.controller;

import com.medistock.catalog.integration.PharmacyStockIntegrationService;
import com.medistock.catalog.integration.dto.MedicationExistenceResponse;
import com.medistock.catalog.integration.dto.StockAvailabilityRequest;
import com.medistock.catalog.integration.dto.StockAvailabilityResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/catalog/integration/stock")
public class CatalogStockIntegrationController {

    private final PharmacyStockIntegrationService pharmacyStockIntegrationService;

    public CatalogStockIntegrationController(PharmacyStockIntegrationService pharmacyStockIntegrationService) {
        this.pharmacyStockIntegrationService = pharmacyStockIntegrationService;
    }

    @GetMapping("/medications/{medicationId}/exists")
    public MedicationExistenceResponse checkMedicationExists(@PathVariable Long medicationId) {
        return pharmacyStockIntegrationService.checkMedicationExists(medicationId);
    }

    @PostMapping("/availability")
    public StockAvailabilityResponse checkAvailability(@RequestBody StockAvailabilityRequest request) {
        return pharmacyStockIntegrationService.checkAvailability(request);
    }
}
