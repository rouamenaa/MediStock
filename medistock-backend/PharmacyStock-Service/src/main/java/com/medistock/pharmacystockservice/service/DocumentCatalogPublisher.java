package com.medistock.pharmacystockservice.service;

import com.medistock.pharmacystockservice.dto.LowStockAlertEventDto;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class DocumentCatalogPublisher {
    private static final Logger log = LoggerFactory.getLogger(DocumentCatalogPublisher.class);

    @Value("${document.service.url:http://localhost:8091}")
    private String documentServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    public void publishLowStockReport(LowStockAlertEventDto event) {
        if (event == null || event.getPharmacyId() == null || event.getMedicationId() == null) {
            return;
        }

        String endpoint = documentServiceUrl + "/documents/events/catalog-generated";

        String referenceId = event.getPharmacyId() + "-" + event.getMedicationId();
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("catalogKey", "STOCK_REPORTS");
        payload.put("referenceId", referenceId);
        payload.put("documentType", "STOCK_ALERT");
        payload.put("title", "Alerte stock pharmacie " + event.getPharmacyId());
        payload.put("generatedByService", "PHARMACYSTOCK-SERVICE");

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("pharmacyId", event.getPharmacyId());
        metadata.put("medicationId", event.getMedicationId());
        metadata.put("remainingQuantity", event.getRemainingQuantity());
        metadata.put("threshold", event.getThreshold());
        payload.put("payload", metadata);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            restTemplate.postForEntity(endpoint, new HttpEntity<>(payload, headers), Object.class);
        } catch (Exception ex) {
            log.error("Impossible de publier document STOCK_ALERT: {}", ex.getMessage());
        }
    }
}
