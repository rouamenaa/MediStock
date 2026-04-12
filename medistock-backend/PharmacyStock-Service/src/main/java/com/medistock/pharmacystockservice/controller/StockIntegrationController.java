package com.medistock.pharmacystockservice.controller;

import com.medistock.pharmacystockservice.dto.MedicationExistenceResponse;
import com.medistock.pharmacystockservice.dto.StockAvailabilityRequest;
import com.medistock.pharmacystockservice.dto.StockAvailabilityResponse;
import com.medistock.pharmacystockservice.service.StockIntegrationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/stock/integration")
public class StockIntegrationController {
    private final StockIntegrationService stockIntegrationService;

    public StockIntegrationController(StockIntegrationService stockIntegrationService) {
        this.stockIntegrationService = stockIntegrationService;
    }

    @GetMapping("/medications/{medicationId}/exists")
    public MedicationExistenceResponse checkMedicationExists(@PathVariable Long medicationId) {
        return stockIntegrationService.checkMedicationExists(medicationId);
    }

    @PostMapping("/availability")
    public StockAvailabilityResponse checkAvailability(@RequestBody StockAvailabilityRequest request) {
        return stockIntegrationService.checkAvailability(request);
    }

    @PostMapping("/availability/batch")
    public StockAvailabilityResponse[] checkAvailabilityBatch(@RequestBody StockAvailabilityRequest[] requests) {
        return stockIntegrationService.checkAvailabilityBatch(requests);
    }
}
