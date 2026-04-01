package com.medistock.catalog.service;

import com.medistock.catalog.domain.ActivePrinciple;
import com.medistock.catalog.dto.ActivePrincipleDto;
import com.medistock.catalog.repository.ActivePrincipleRepository;
import com.medistock.catalog.repository.MedicationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ActivePrincipleService {

    private final ActivePrincipleRepository repository;
    private final MedicationRepository medicationRepository;

    public ActivePrincipleService(ActivePrincipleRepository repository, MedicationRepository medicationRepository) {
        this.repository = repository;
        this.medicationRepository = medicationRepository;
    }

    @Transactional(readOnly = true)
    public List<ActivePrincipleDto> findAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ActivePrincipleDto getById(Long id) {
        return repository.findById(id).map(this::toDto).orElseThrow(() -> new ResourceNotFoundException("ActivePrinciple", id));
    }

    @Transactional(readOnly = true)
    public List<ActivePrincipleDto> search(String query) {
        if (query == null || query.isBlank()) return findAll();
        return repository.searchByNameOrCode(query.trim()).stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public ActivePrincipleDto create(ActivePrincipleDto dto) {
        if (repository.findByCode(dto.getCode()).isPresent()) {
            throw new IllegalArgumentException("Un principe actif avec le code '" + dto.getCode() + "' existe déjà.");
        }
        ActivePrinciple entity = new ActivePrinciple();
        entity.setCode(dto.getCode());
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity = repository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public ActivePrincipleDto update(Long id, ActivePrincipleDto dto) {
        ActivePrinciple entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("ActivePrinciple", id));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        if (dto.getCode() != null && !dto.getCode().equals(entity.getCode())) {
            if (repository.findByCode(dto.getCode()).isPresent()) throw new IllegalArgumentException("Code déjà utilisé.");
            entity.setCode(dto.getCode());
        }
        entity = repository.save(entity);
        return toDto(entity);
    }

    @Transactional
    public void deleteById(Long id) {
        if (medicationRepository.countByActivePrincipleId(id) > 0) {
            throw new IllegalArgumentException(
                "Impossible de supprimer : au moins un médicament utilise ce principe actif.");
        }
        ActivePrinciple entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("ActivePrinciple", id));
        repository.delete(entity);
    }

    private ActivePrincipleDto toDto(ActivePrinciple e) {
        ActivePrincipleDto dto = new ActivePrincipleDto();
        dto.setId(e.getId());
        dto.setCode(e.getCode());
        dto.setName(e.getName());
        dto.setDescription(e.getDescription());
        return dto;
    }
}
