package com.medistock.catalog.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Point d'entrée racine du catalogue : évite un 404 sur GET /api/catalog/
 */
@RestController
@RequestMapping("/api/catalog")
public class CatalogApiController {

    @GetMapping(value = {"", "/"})
    public ResponseEntity<Map<String, Object>> catalogInfo() {
        return ResponseEntity.ok(Map.of(
            "service", "Medication Catalog Service",
            "description", "Base de référence des médicaments - Medistock",
            "endpoints", Map.of(
                "medications", "/api/catalog/medications",
                "medicationLookupByCodeAndDosage", "/api/catalog/medications/lookup?productCode=...&dosage=...",
                "categories", "/api/catalog/categories",
                "activePrinciples", "/api/catalog/active-principles",
                "searchByActivePrinciple", "/api/catalog/medications/search/by-active-principle?q=...",
                "stockMedicationExists", "/api/catalog/integration/stock/medications/{medicationId}/exists",
                "stockAvailability", "/api/catalog/integration/stock/availability"
            )
        ));
    }
}
