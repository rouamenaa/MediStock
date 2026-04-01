package com.medistock.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.HashSet;
import java.util.Set;

/**
 * Médicament de la base de référence.
 * Peut être un médicament de référence ou un générique (équivalent).
 */
@Entity
@Table(name = "medications", indexes = {
    @Index(name = "idx_medication_name", columnList = "name"),
    @Index(name = "idx_medication_active_principle", columnList = "active_principle_id"),
    @Index(name = "idx_medication_reference", columnList = "reference_medication_id")
})
public class Medication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    /** Forme pharmaceutique: comprimé, gélule, sirop, etc. */
    @Column(length = 100)
    private String form;

    /** Dosage (ex: 500 mg, 10 mg/ml) */
    @Column(length = 100)
    private String dosage;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "active_principle_id", nullable = false)
    private ActivePrinciple activePrinciple;

    /** Médicament de référence si ce médicament est un générique; null sinon. */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reference_medication_id")
    private Medication referenceMedication;

    /** Génériques de ce médicament (si c'est un médicament de référence). */
    @OneToMany(mappedBy = "referenceMedication", cascade = {}, fetch = FetchType.LAZY)
    private Set<Medication> genericEquivalents = new HashSet<>();

    @ManyToMany(fetch = FetchType.LAZY, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JoinTable(
        name = "medication_categories",
        joinColumns = @JoinColumn(name = "medication_id"),
        inverseJoinColumns = @JoinColumn(name = "category_id")
    )
    private Set<Category> categories = new HashSet<>();

    @Column(length = 50)
    private String laboratory;

    /** Code produit / CIP si applicable */
    @Column(length = 50)
    private String productCode;

    private boolean active = true;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getForm() { return form; }
    public void setForm(String form) { this.form = form; }
    public String getDosage() { return dosage; }
    public void setDosage(String dosage) { this.dosage = dosage; }
    public ActivePrinciple getActivePrinciple() { return activePrinciple; }
    public void setActivePrinciple(ActivePrinciple activePrinciple) { this.activePrinciple = activePrinciple; }
    public Medication getReferenceMedication() { return referenceMedication; }
    public void setReferenceMedication(Medication referenceMedication) { this.referenceMedication = referenceMedication; }
    public Set<Medication> getGenericEquivalents() { return genericEquivalents; }
    public void setGenericEquivalents(Set<Medication> genericEquivalents) { this.genericEquivalents = genericEquivalents; }
    public Set<Category> getCategories() { return categories; }
    public void setCategories(Set<Category> categories) { this.categories = categories; }
    public String getLaboratory() { return laboratory; }
    public void setLaboratory(String laboratory) { this.laboratory = laboratory; }
    public String getProductCode() { return productCode; }
    public void setProductCode(String productCode) { this.productCode = productCode; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
}
