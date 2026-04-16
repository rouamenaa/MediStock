package com.medistock.catalog.messaging;

import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConditionalOnProperty(prefix = "medistock.catalog.rabbit", name = "enabled", havingValue = "true", matchIfMissing = true)
public class RabbitCatalogMessagingConfiguration {

    @Bean
    public TopicExchange medistockCatalogTopicExchange(CatalogRabbitProperties properties) {
        return new TopicExchange(properties.getExchange(), true, false);
    }

    /**
     * Used by {@link org.springframework.boot.autoconfigure.amqp.RabbitAutoConfiguration} for {@link org.springframework.amqp.rabbit.core.RabbitTemplate}.
     */
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}
