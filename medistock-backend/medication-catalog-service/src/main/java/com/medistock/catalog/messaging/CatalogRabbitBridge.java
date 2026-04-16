package com.medistock.catalog.messaging;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@ConditionalOnProperty(prefix = "medistock.catalog.rabbit", name = "enabled", havingValue = "true", matchIfMissing = true)
@ConditionalOnBean(RabbitTemplate.class)
public class CatalogRabbitBridge {

    private static final Logger log = LoggerFactory.getLogger(CatalogRabbitBridge.class);

    private final RabbitTemplate rabbitTemplate;
    private final CatalogRabbitProperties properties;

    public CatalogRabbitBridge(RabbitTemplate rabbitTemplate, CatalogRabbitProperties properties) {
        this.rabbitTemplate = rabbitTemplate;
        this.properties = properties;
    }

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void forwardToRabbit(CatalogOutboundEvent event) {
        try {
            rabbitTemplate.convertAndSend(properties.getExchange(), event.routingKey(), event.envelope());
        } catch (Exception e) {
            log.warn("Failed to publish catalog event routingKey={}: {}", event.routingKey(), e.getMessage());
        }
    }
}
