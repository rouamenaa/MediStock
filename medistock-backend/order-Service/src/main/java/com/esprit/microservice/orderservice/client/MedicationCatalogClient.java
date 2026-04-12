package com.esprit.microservice.orderservice.client;

import com.esprit.microservice.orderservice.dto.MedicationCatalogDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "medication-catalog-service", path = "/api/catalog/medications")
public interface MedicationCatalogClient {
    @GetMapping("/{id}")
    MedicationCatalogDto getMedicationById(@PathVariable("id") Long id);
}
