package com.medistock.catalog.service;

import com.medistock.catalog.domain.Category;
import com.medistock.catalog.domain.Medication;
import com.medistock.catalog.dto.CategoryDto;
import com.medistock.catalog.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private final CategoryRepository repository;

    public CategoryService(CategoryRepository repository) {
        this.repository = repository;
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
        return toDto(entity);
    }

    @Transactional
    public CategoryDto update(Long id, CategoryDto dto) {
        Category entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category", id));
        entity.setName(dto.getName());
        entity.setDescription(dto.getDescription());
        entity = repository.save(entity);
        return toDto(entity);
    }

    /** Retire la catégorie des médicaments associés puis supprime l'entité. */
    @Transactional
    public void delete(Long id) {
        Category entity = repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category", id));
        for (Medication m : new HashSet<>(entity.getMedications())) {
            m.getCategories().remove(entity);
        }
        repository.delete(entity);
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
