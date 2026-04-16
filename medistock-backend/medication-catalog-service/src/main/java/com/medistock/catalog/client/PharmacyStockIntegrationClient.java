package com.medistock.catalog.client;

import com.medistock.catalog.integration.dto.MedicationExistenceResponse;
import com.medistock.catalog.integration.dto.StockAvailabilityRequest;
import com.medistock.catalog.integration.dto.StockAvailabilityResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
    name = "${medistock.pharmacy-stock.service-name:PharmacyStock-Service}",
    url = "${medistock.pharmacy-stock.base-url:http://localhost:8081}",
    path = "/api/stock/integration"
)
public interface PharmacyStockIntegrationClient {

    @GetMapping("/medications/{medicationId}/exists")
    MedicationExistenceResponse checkMedicationExists(@PathVariable("medicationId") Long medicationId);

    @PostMapping("/availability")
    StockAvailabilityResponse checkAvailability(@RequestBody StockAvailabilityRequest request);
}
