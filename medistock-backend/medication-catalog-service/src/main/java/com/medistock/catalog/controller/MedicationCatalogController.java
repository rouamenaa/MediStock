package com.medistock.catalog.controller;

import com.medistock.catalog.dto.*;
import com.medistock.catalog.service.MedicationCatalogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * API du catalogue de médicaments.
 * Commandes principales: ajouter médicament, associer catégories, gérer équivalents (génériques), rechercher par principe actif.
 */
@RestController
@RequestMapping("/api/catalog/medications")
public class MedicationCatalogController {

    private final MedicationCatalogService catalogService;

    public MedicationCatalogController(MedicationCatalogService catalogService) {
        this.catalogService = catalogService;
    }

    /** Ajouter un médicament */
    @PostMapping
    public ResponseEntity<MedicationDto> addMedication(@Valid @RequestBody MedicationDto dto) {
        MedicationDto created = catalogService.addMedication(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /** Mettre à jour un médicament */
    @PutMapping("/{id}")
    public ResponseEntity<MedicationDto> updateMedication(@PathVariable Long id, @Valid @RequestBody MedicationDto dto) {
        return ResponseEntity.ok(catalogService.update(id, dto));
    }

    /** Récupérer un médicament par ID */
    @GetMapping("/{id}")
    public ResponseEntity<MedicationDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.getById(id));
    }

    /** Récupérer un médicament actif par code produit + dosage */
    @GetMapping("/lookup")
    public ResponseEntity<MedicationDto> getByProductCodeAndDosage(@RequestParam String productCode,
                                                                    @RequestParam String dosage) {
        if (productCode == null || productCode.isBlank()) {
            throw new IllegalArgumentException("productCode is required");
        }
        if (dosage == null || dosage.isBlank()) {
            throw new IllegalArgumentException("dosage is required");
        }
        return ResponseEntity.ok(catalogService.getByProductCodeAndDosage(productCode, dosage));
    }

    /** Recherche par nom de médicament */
    @GetMapping
    public ResponseEntity<List<MedicationDto>> searchByName(@RequestParam(required = false) String name) {
        return ResponseEntity.ok(catalogService.searchByName(name));
    }

    /** Rechercher par principe actif (nom ou code DCI) */
    @GetMapping("/search/by-active-principle")
    public ResponseEntity<List<MedicationDto>> searchByActivePrinciple(@RequestParam(required = false) String q) {
        return ResponseEntity.ok(catalogService.searchByActivePrinciple(q));
    }

    /** Médicaments par ID de principe actif */
    @GetMapping("/by-active-principle/{activePrincipleId}")
    public ResponseEntity<List<MedicationDto>> findByActivePrincipleId(@PathVariable Long activePrincipleId) {
        return ResponseEntity.ok(catalogService.findByActivePrincipleId(activePrincipleId));
    }

    /** Associer des catégories à un médicament */
    @PutMapping("/{id}/categories")
    public ResponseEntity<MedicationDto> associateCategories(@PathVariable Long id, @Valid @RequestBody AssociateCategoriesRequest request) {
        return ResponseEntity.ok(catalogService.associateCategories(id, request));
    }

    /** Déclarer un médicament comme équivalent générique d'un médicament de référence */
    @PostMapping("/{referenceMedicationId}/generics")
    public ResponseEntity<MedicationDto> addGenericEquivalent(@PathVariable Long referenceMedicationId, @Valid @RequestBody GenericEquivalentRequest request) {
        return ResponseEntity.ok(catalogService.setGenericEquivalent(referenceMedicationId, request));
    }

    /** Lister les équivalents génériques d'un médicament de référence */
    @GetMapping("/{referenceMedicationId}/generics")
    public ResponseEntity<List<MedicationDto>> getGenericEquivalents(@PathVariable Long referenceMedicationId) {
        return ResponseEntity.ok(catalogService.getGenericEquivalents(referenceMedicationId));
    }

    /** Retirer l'association générique d'un médicament */
    @DeleteMapping("/{id}/generic-reference")
    public ResponseEntity<MedicationDto> removeGenericEquivalent(@PathVariable Long id) {
        return ResponseEntity.ok(catalogService.removeGenericEquivalent(id));
    }

    /** Supprimer un médicament du catalogue */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedication(@PathVariable Long id) {
        catalogService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
