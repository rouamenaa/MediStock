package com.medistock.catalog.service;

import com.medistock.catalog.dto.MedicationDto;
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

    public void publishMedicationTechnicalSheet(MedicationDto medication) {
        if (medication == null || medication.getId() == null) {
            return;
        }

        String endpoint = documentServiceUrl + "/documents/events/catalog-generated";

        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("catalogKey", "MEDICATION_CATALOG");
        payload.put("referenceId", String.valueOf(medication.getId()));
        payload.put("documentType", "TECHNICAL_SHEET");
        payload.put("title", "Fiche technique - " + medication.getName());
        payload.put("generatedByService", "MEDICATION-CATALOG-SERVICE");

        Map<String, Object> metadata = new LinkedHashMap<>();
        metadata.put("medicationId", medication.getId());
        metadata.put("name", medication.getName());
        metadata.put("form", medication.getForm());
        metadata.put("dosage", medication.getDosage());
        metadata.put("activePrincipleId", medication.getActivePrincipleId());
        metadata.put("activePrincipleName", medication.getActivePrincipleName());
        metadata.put("activePrincipleCode", medication.getActivePrincipleCode());
        metadata.put("laboratory", medication.getLaboratory());
        metadata.put("productCode", medication.getProductCode());
        metadata.put("active", medication.isActive());
        payload.put("payload", metadata);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        try {
            restTemplate.postForEntity(endpoint, new HttpEntity<>(payload, headers), Object.class);
        } catch (Exception ex) {
            log.error("Impossible de générer la fiche catalogue pour médicament {}: {}", medication.getId(),
                    ex.getMessage());
        }
    }
}
