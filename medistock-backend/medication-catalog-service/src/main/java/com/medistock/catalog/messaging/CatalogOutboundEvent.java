package com.medistock.catalog.messaging;

/**
 * Published on the Spring event bus; {@link CatalogRabbitBridge} forwards to RabbitMQ after transaction commit.
 */
public record CatalogOutboundEvent(String routingKey, CatalogMessageEnvelope envelope) {}
