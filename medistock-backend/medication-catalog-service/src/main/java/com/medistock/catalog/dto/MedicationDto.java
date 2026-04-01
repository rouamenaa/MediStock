package com.medistock.catalog.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.Set;

public class MedicationDto {
    private Long id;
    @NotBlank
    private String name;
    private String form;
    private String dosage;
    @NotNull
    private Long activePrincipleId;
    private Long referenceMedicationId;
    private Set<Long> categoryIds;
    private String laboratory;
    private String productCode;
    private boolean active = true;

    // Résumé du principe actif (pour les réponses)
    private String activePrincipleName;
    private String activePrincipleCode;
    // Nom du médicament de référence si générique
    private String referenceMedicationName;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getForm() { return form; }
    public void setForm(String form) { this.form = form; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public Long getActivePrincipleId() { return activePrincipleId; }
    public void setActivePrincipleId(Long activePrincipleId) { this.activePrincipleId = activePrincipleId; }
    public Long getReferenceMedicationId() { return referenceMedicationId; }
    public void setReferenceMedicationId(Long referenceMedicationId) { this.referenceMedicationId = referenceMedicationId; }
    public Set<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(Set<Long> categoryIds) { this.categoryIds = categoryIds; }
    public String getLaboratory() { return laboratory; }
    public void setLaboratory(String laboratory) { this.laboratory = laboratory; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public String getActivePrincipleName() { return activePrincipleName; }
    public void setActivePrincipleName(String activePrincipleName) { this.activePrincipleName = activePrincipleName; }
    public String getActivePrincipleCode() { return activePrincipleCode; }
    public void setActivePrincipleCode(String activePrincipleCode) { this.activePrincipleCode = activePrincipleCode; }
    public String getReferenceMedicationName() { return referenceMedicationName; }
    public void setReferenceMedicationName(String referenceMedicationName) { this.referenceMedicationName = referenceMedicationName; }
}
