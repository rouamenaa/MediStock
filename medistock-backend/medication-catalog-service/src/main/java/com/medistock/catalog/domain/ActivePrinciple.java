package com.medistock.catalog.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.util.ArrayList;
import java.util.List;

/**
 * Principe actif (DCI - Dénomination Commune Internationale).
 * Permet la recherche par principe actif.
 */
@Entity
@Table(name = "active_principles", indexes = {
    @Index(name = "idx_active_principle_name", columnList = "name"),
    @Index(name = "idx_active_principle_code", columnList = "code")
})
public class ActivePrinciple {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String code;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @Column(length = 1000)
    private String description;

    @OneToMany(mappedBy = "activePrinciple", cascade = CascadeType.ALL, orphanRemoval = false)
    private List<Medication> medications = new ArrayList<>();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public List<Medication> getMedications() { return medications; }
    public void setMedications(List<Medication> medications) { this.medications = medications; }
}
