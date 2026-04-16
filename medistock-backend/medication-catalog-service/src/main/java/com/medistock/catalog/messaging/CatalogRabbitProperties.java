package com.medistock.catalog.messaging;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "medistock.catalog.rabbit")
public class CatalogRabbitProperties {

    /**
     * When false, no events are emitted and {@code CatalogRabbitBridge} is not registered.
     * Use profile {@code norabbit} (see application-norabbit.properties) to disable AMQP autoconfig if RabbitMQ is not installed.
     */
    private boolean enabled = true;

    /** Topic exchange name; consumers bind their queues with routing keys such as {@code catalog.medication.*}. */
    private String exchange = "medistock.catalog";

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public String getExchange() {
        return exchange;
    }

    public void setExchange(String exchange) {
        this.exchange = exchange;
    }
}
