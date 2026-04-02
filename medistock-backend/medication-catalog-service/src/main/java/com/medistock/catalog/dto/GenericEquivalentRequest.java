package com.medistock.catalog.dto;

import jakarta.validation.constraints.NotNull;

/**
 * Associer un médicament comme équivalent générique d'un médicament de référence.
 */
public class GenericEquivalentRequest {
    @NotNull(message = "L'ID du médicament générique est requis")
    private Long genericMedicationId;

    public Long getGenericMedicationId() { return genericMedicationId; }
    public void setGenericMedicationId(Long genericMedicationId) { this.genericMedicationId = genericMedicationId; }
}
