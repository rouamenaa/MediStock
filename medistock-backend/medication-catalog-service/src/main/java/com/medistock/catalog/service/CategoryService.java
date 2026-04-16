package com.medistock.catalog.service;

import com.medistock.catalog.domain.Category;
import com.medistock.catalog.domain.Medication;
import com.medistock.catalog.dto.CategoryDto;
import com.medistock.catalog.messaging.CatalogRabbitEventEmitter;
import com.medistock.catalog.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository repository;
    private final CatalogRabbitEventEmitter catalogEvents;

    public CategoryService(
            CategoryRepository categoryRepository,
            CatalogRabbitEventEmitter catalogRabbitEventEmitter) {
        this.repository = categoryRepository;
        this.catalogEvents = catalogRabbitEventEmitter;
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> findAll() {
        return repository.findAll().stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public CategoryDto getById(Long id) {
        return repository.findById(id).map(this::toDto).orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    @Transactional
    public CategoryDto create(CategoryDto dto) {
        if (repository.findByName(dto.getName()).isPresent()) {
            throw new IllegalArgumentException("Une catégorie avec le nom '" + dto.getName() + "' existe déjà.");
        }
        Category entity = new Category();
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity = repository.save(entity);
        CategoryDto created = toDto(entity);
        catalogEvents.categoryCreated(created);
        return created;
    }

    @Transactional
    public CategoryDto update(Long id, CategoryDto dto) {
        Category entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category", id));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity = repository.save(entity);
        CategoryDto updated = toDto(entity);
        catalogEvents.categoryUpdated(updated);
        return updated;
    }

    /** Retire la catégorie des médicaments associés puis supprime l'entité. */
    @Transactional
    public void delete(Long id) {
        Category entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category", id));
        for (Medication medication : new HashSet<>(entity.getMedications())) {
            medication.getCategories().remove(entity);
        }
        Long categoryId = entity.getId();
        repository.delete(entity);
        catalogEvents.categoryDeleted(categoryId);
    }

    Category getEntityById(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category", id));
    }

    CategoryDto toDto(Category e) {
        CategoryDto dto = new CategoryDto();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setDescription(e.getDescription());
        return dto;
    }
}
