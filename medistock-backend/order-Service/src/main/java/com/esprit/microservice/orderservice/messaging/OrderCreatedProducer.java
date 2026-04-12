package com.esprit.microservice.orderservice.messaging;

import com.esprit.microservice.orderservice.dto.OrderCreatedEventDto;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedProducer {
    private final RabbitTemplate rabbitTemplate;
    private final String exchange;
    private final String routingKey;

    public OrderCreatedProducer(
            RabbitTemplate rabbitTemplate,
            @Value("${medistock.rabbitmq.exchange:medistock.exchange}") String exchange,
            @Value("${medistock.rabbitmq.order-created-routing-key:order.created}") String routingKey) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
        this.routingKey = routingKey;
    }

    public void publish(OrderCreatedEventDto event) {
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    }
}
