package com.esprit.microservice.orderservice.client;

import com.esprit.microservice.orderservice.dto.PharmacyDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "pharmacy-management-service", path = "/api/pharmacies")
public interface PharmacyManagementClient {
    @GetMapping("/{id}")
    PharmacyDto getPharmacyById(@PathVariable("id") Long id);
}
