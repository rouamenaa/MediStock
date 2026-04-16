package com.medistock.catalog.messaging;

import com.medistock.catalog.dto.ActivePrincipleDto;
import com.medistock.catalog.dto.CategoryDto;
import com.medistock.catalog.dto.MedicationDto;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Component;

@Component
public class CatalogRabbitEventEmitter {

    static final String AGG_MEDICATION = "MEDICATION";
    static final String AGG_CATEGORY = "CATEGORY";
    static final String AGG_ACTIVE_PRINCIPLE = "ACTIVE_PRINCIPLE";

    static final String EVT_CREATED = "CREATED";
    static final String EVT_UPDATED = "UPDATED";
    static final String EVT_DELETED = "DELETED";

    private final ApplicationEventPublisher publisher;
    private final CatalogRabbitProperties properties;

    public CatalogRabbitEventEmitter(ApplicationEventPublisher publisher, CatalogRabbitProperties properties) {
        this.publisher = publisher;
        this.properties = properties;
    }

    public void medicationCreated(MedicationDto dto) {
        emit("catalog.medication." + EVT_CREATED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_MEDICATION, EVT_CREATED, dto.getId(), dto));
    }

    public void medicationUpdated(MedicationDto dto) {
        emit("catalog.medication." + EVT_UPDATED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_MEDICATION, EVT_UPDATED, dto.getId(), dto));
    }

    public void medicationDeleted(Long id) {
        emit("catalog.medication." + EVT_DELETED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_MEDICATION, EVT_DELETED, id, null));
    }

    public void categoryCreated(CategoryDto dto) {
        emit("catalog.category." + EVT_CREATED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_CATEGORY, EVT_CREATED, dto.getId(), dto));
    }

    public void categoryUpdated(CategoryDto dto) {
        emit("catalog.category." + EVT_UPDATED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_CATEGORY, EVT_UPDATED, dto.getId(), dto));
    }

    public void categoryDeleted(Long id) {
        emit("catalog.category." + EVT_DELETED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_CATEGORY, EVT_DELETED, id, null));
    }

    public void activePrincipleCreated(ActivePrincipleDto dto) {
        emit("catalog.active-principle." + EVT_CREATED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_ACTIVE_PRINCIPLE, EVT_CREATED, dto.getId(), dto));
    }

    public void activePrincipleUpdated(ActivePrincipleDto dto) {
        emit("catalog.active-principle." + EVT_UPDATED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_ACTIVE_PRINCIPLE, EVT_UPDATED, dto.getId(), dto));
    }

    public void activePrincipleDeleted(Long id) {
        emit("catalog.active-principle." + EVT_DELETED.toLowerCase(),
            CatalogMessageEnvelope.of(AGG_ACTIVE_PRINCIPLE, EVT_DELETED, id, null));
    }

    private void emit(String routingKey, CatalogMessageEnvelope envelope) {
        if (!properties.isEnabled()) {
            return;
        }
        publisher.publishEvent(new CatalogOutboundEvent(routingKey, envelope));
    }
}
