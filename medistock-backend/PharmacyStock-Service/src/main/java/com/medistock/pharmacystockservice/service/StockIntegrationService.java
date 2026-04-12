package com.medistock.pharmacystockservice.service;

import com.medistock.pharmacystockservice.client.MedicationCatalogClient;
import com.medistock.pharmacystockservice.dto.MedicationCatalogDto;
import com.medistock.pharmacystockservice.dto.MedicationExistenceResponse;
import com.medistock.pharmacystockservice.dto.StockAvailabilityRequest;
import com.medistock.pharmacystockservice.dto.StockAvailabilityResponse;
import feign.FeignException;
import org.springframework.stereotype.Service;

@Service
public class StockIntegrationService {
    private final MedicationCatalogClient medicationCatalogClient;
    private final StockItemService stockItemService;

    public StockIntegrationService(MedicationCatalogClient medicationCatalogClient, StockItemService stockItemService) {
        this.medicationCatalogClient = medicationCatalogClient;
        this.stockItemService = stockItemService;
    }

    public MedicationExistenceResponse checkMedicationExists(Long medicationId) {
        try {
            MedicationCatalogDto medication = medicationCatalogClient.getMedicationById(medicationId);
            boolean exists = medication != null && medication.getId() != null;
            return new MedicationExistenceResponse(medicationId, exists);
        } catch (FeignException.NotFound ex) {
            return new MedicationExistenceResponse(medicationId, false);
        }
    }

    public StockAvailabilityResponse checkAvailability(StockAvailabilityRequest request) {
        int availableQuantity = stockItemService.getAvailableQuantity(request.getPharmacyId(),
                request.getMedicationId());
        StockAvailabilityResponse response = new StockAvailabilityResponse();
        response.setPharmacyId(request.getPharmacyId());
        response.setMedicationId(request.getMedicationId());
        response.setRequestedQuantity(request.getRequestedQuantity());
        response.setAvailableQuantity(availableQuantity);
        response.setAvailable(availableQuantity >= request.getRequestedQuantity());
        return response;
    }

    public StockAvailabilityResponse[] checkAvailabilityBatch(StockAvailabilityRequest[] requests) {
        StockAvailabilityResponse[] responses = new StockAvailabilityResponse[requests.length];
        for (int i = 0; i < requests.length; i++) {
            responses[i] = checkAvailability(requests[i]);
        }
        return responses;
    }
}
