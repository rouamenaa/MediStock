package com.medistock.catalog.service;

import com.medistock.catalog.domain.ActivePrinciple;
import com.medistock.catalog.domain.Category;
import com.medistock.catalog.domain.Medication;
import com.medistock.catalog.dto.*;
import com.medistock.catalog.repository.ActivePrincipleRepository;
import com.medistock.catalog.repository.MedicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class MedicationCatalogService {

    private final MedicationRepository medicationRepository;
    private final ActivePrincipleRepository activePrincipleRepository;
    private final CategoryService categoryService;

    public MedicationCatalogService(MedicationRepository medicationRepository,
                                    ActivePrincipleRepository activePrincipleRepository,
                                    CategoryService categoryService) {
        this.medicationRepository = medicationRepository;
        this.activePrincipleRepository = activePrincipleRepository;
        this.categoryService = categoryService;
    }

    /** Ajouter un médicament */
    @Transactional
    public MedicationDto addMedication(MedicationDto dto) {
        ActivePrinciple ap = activePrincipleRepository.findById(dto.getActivePrincipleId())
            .orElseThrow(() -> new ResourceNotFoundException("ActivePrinciple", dto.getActivePrincipleId()));
        Medication ref = null;
        if (dto.getReferenceMedicationId() != null) {
            ref = medicationRepository.findById(dto.getReferenceMedicationId())
                .orElseThrow(() -> new ResourceNotFoundException("Medication", dto.getReferenceMedicationId()));
        }
        Medication m = new Medication();
        m.setName(dto.getName());
        m.setForm(dto.getForm());
        m.setDosage(dto.getDosage());
        m.setActivePrinciple(ap);
        m.setReferenceMedication(ref);
        m.setLaboratory(dto.getLaboratory());
        m.setProductCode(dto.getProductCode());
        m.setActive(dto.isActive());
        if (dto.getCategoryIds() != null && !dto.getCategoryIds().isEmpty()) {
            Set<Category> categories = new HashSet<>();
            for (Long catId : dto.getCategoryIds()) {
                categories.add(categoryService.getEntityById(catId));
            }
            m.setCategories(categories);
        }
        m = medicationRepository.save(m);
        return toDto(m);
    }

    /** Associer des catégories à un médicament */
    @Transactional
    public MedicationDto associateCategories(Long medicationId, AssociateCategoriesRequest request) {
        Medication m = medicationRepository.findById(medicationId).orElseThrow(() -> new ResourceNotFoundException("Medication", medicationId));
        Set<Category> categories = new HashSet<>();
        for (Long catId : request.getCategoryIds()) {
            categories.add(categoryService.getEntityById(catId));
        }
        m.getCategories().clear();
        m.getCategories().addAll(categories);
        m = medicationRepository.save(m);
        return toDto(m);
    }

    /** Déclarer un médicament comme équivalent générique d'un médicament de référence */
    @Transactional
    public MedicationDto setGenericEquivalent(Long referenceMedicationId, GenericEquivalentRequest request) {
        Medication reference = medicationRepository.findById(referenceMedicationId).orElseThrow(() -> new ResourceNotFoundException("Medication", referenceMedicationId));
        Medication generic = medicationRepository.findById(request.getGenericMedicationId()).orElseThrow(() -> new ResourceNotFoundException("Medication", request.getGenericMedicationId()));
        generic.setReferenceMedication(reference);
        generic = medicationRepository.save(generic);
        return toDto(generic);
    }

    /** Retirer l'association générique */
    @Transactional
    public MedicationDto removeGenericEquivalent(Long medicationId) {
        Medication m = medicationRepository.findById(medicationId).orElseThrow(() -> new ResourceNotFoundException("Medication", medicationId));
        m.setReferenceMedication(null);
        m = medicationRepository.save(m);
        return toDto(m);
    }

    /** Rechercher par principe actif (nom ou code) */
    @Transactional(readOnly = true)
    public List<MedicationDto> searchByActivePrinciple(String activePrincipleQuery) {
        if (activePrincipleQuery == null || activePrincipleQuery.isBlank()) {
            return medicationRepository.findAll().stream().filter(Medication::isActive).map(this::toDto).collect(Collectors.toList());
        }
        return medicationRepository.findByActivePrincipleNameOrCode(activePrincipleQuery.trim()).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> findByActivePrincipleId(Long activePrincipleId) {
        return medicationRepository.findByActivePrincipleIdAndActiveTrue(activePrincipleId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> getGenericEquivalents(Long referenceMedicationId) {
        return medicationRepository.findByReferenceMedicationIdAndActiveTrue(referenceMedicationId).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public MedicationDto getById(Long id) {
        Medication m = medicationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Medication", id));
        return toDto(m);
    }

    @Transactional(readOnly = true)
    public List<MedicationDto> searchByName(String name) {
        if (name == null || name.isBlank()) return medicationRepository.findAll().stream().filter(Medication::isActive).map(this::toDto).collect(Collectors.toList());
        return medicationRepository.findByNameContainingIgnoreCaseAndActiveTrue(name.trim()).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public MedicationDto update(Long id, MedicationDto dto) {
        Medication m = medicationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Medication", id));
        m.setName(dto.getName());
        m.setForm(dto.getForm());
        m.setDosage(dto.getDosage());
        m.setLaboratory(dto.getLaboratory());
        m.setProductCode(dto.getProductCode());
        m.setActive(dto.isActive());
        if (dto.getActivePrincipleId() != null) {
            ActivePrinciple ap = activePrincipleRepository.findById(dto.getActivePrincipleId()).orElseThrow(() -> new ResourceNotFoundException("ActivePrinciple", dto.getActivePrincipleId()));
            m.setActivePrinciple(ap);
        }
        if (dto.getCategoryIds() != null) {
            Set<Category> categories = new HashSet<>();
            for (Long catId : dto.getCategoryIds()) {
                categories.add(categoryService.getEntityById(catId));
            }
            m.setCategories(categories);
        }
        m = medicationRepository.save(m);
        return toDto(m);
    }

    /**
     * Supprime un médicament du catalogue. Les génériques qui pointaient vers lui
     * comme référence voient leur lien retiré.
     */
    @Transactional
    public void delete(Long id) {
        Medication m = medicationRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Medication", id));
        for (Medication generic : medicationRepository.findByReferenceMedicationId(id)) {
            generic.setReferenceMedication(null);
            medicationRepository.save(generic);
        }
        m.getCategories().clear();
        medicationRepository.delete(m);
    }

    private MedicationDto toDto(Medication m) {
        MedicationDto dto = new MedicationDto();
        dto.setId(m.getId());
        dto.setName(m.getName());
        dto.setForm(m.getForm());
        dto.setDosage(m.getDosage());
        dto.setActivePrincipleId(m.getActivePrinciple().getId());
        dto.setActivePrincipleName(m.getActivePrinciple().getName());
        dto.setActivePrincipleCode(m.getActivePrinciple().getCode());
        dto.setReferenceMedicationId(m.getReferenceMedication() != null ? m.getReferenceMedication().getId() : null);
        dto.setReferenceMedicationName(m.getReferenceMedication() != null ? m.getReferenceMedication().getName() : null);
        dto.setCategoryIds(m.getCategories().stream().map(Category::getId).collect(Collectors.toSet()));
        dto.setLaboratory(m.getLaboratory());
        dto.setProductCode(m.getProductCode());
        dto.setActive(m.isActive());
        return dto;
    }
}
