package com.medistock.catalog.messaging;

import java.time.Instant;

/**
 * JSON body sent to RabbitMQ. Routing key (e.g. {@code catalog.medication.created}) describes the event.
 */
public record CatalogMessageEnvelope(
    Instant occurredAt,
    String aggregateType,
    String eventType,
    Long aggregateId,
    Object payload
) {
    public static CatalogMessageEnvelope of(String aggregateType, String eventType, Long aggregateId, Object payload) {
        return new CatalogMessageEnvelope(Instant.now(), aggregateType, eventType, aggregateId, payload);
    }
}
