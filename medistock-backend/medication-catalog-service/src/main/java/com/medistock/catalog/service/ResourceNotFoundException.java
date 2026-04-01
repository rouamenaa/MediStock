package com.medistock.catalog.service;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Object id) {
        super(resourceName + " non trouvé(e) avec l'identifiant: " + id);
    }
}
