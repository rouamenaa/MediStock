package com.medistock.catalog.integration;

import com.medistock.catalog.client.PharmacyStockIntegrationClient;
import com.medistock.catalog.integration.dto.MedicationExistenceResponse;
import com.medistock.catalog.integration.dto.StockAvailabilityRequest;
import com.medistock.catalog.integration.dto.StockAvailabilityResponse;
import feign.FeignException;
import org.springframework.stereotype.Service;

@Service
public class PharmacyStockIntegrationService {

    private final PharmacyStockIntegrationClient pharmacyStockIntegrationClient;

    public PharmacyStockIntegrationService(PharmacyStockIntegrationClient pharmacyStockIntegrationClient) {
        this.pharmacyStockIntegrationClient = pharmacyStockIntegrationClient;
    }

    public MedicationExistenceResponse checkMedicationExists(Long medicationId) {
        try {
            return pharmacyStockIntegrationClient.checkMedicationExists(medicationId);
        } catch (FeignException.NotFound ex) {
            return new MedicationExistenceResponse(medicationId, false);
        }
    }

    public StockAvailabilityResponse checkAvailability(StockAvailabilityRequest request) {
        return pharmacyStockIntegrationClient.checkAvailability(request);
    }
}
