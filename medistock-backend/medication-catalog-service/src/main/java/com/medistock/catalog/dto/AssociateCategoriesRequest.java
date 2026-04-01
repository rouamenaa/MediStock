package com.medistock.catalog.dto;

import jakarta.validation.constraints.NotEmpty;

import java.util.Set;

public class AssociateCategoriesRequest {
    @NotEmpty(message = "Au moins une catégorie doit être fournie")
    private Set<Long> categoryIds;

    public Set<Long> getCategoryIds() { return categoryIds; }
    public void setCategoryIds(Set<Long> categoryIds) { this.categoryIds = categoryIds; }
}
