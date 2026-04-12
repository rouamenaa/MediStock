package com.medistock.pharmacystockservice.messaging;

import com.medistock.pharmacystockservice.dto.LowStockAlertEventDto;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class LowStockAlertProducer {
    private final RabbitTemplate rabbitTemplate;
    private final String exchange;
    private final String routingKey;

    public LowStockAlertProducer(
            RabbitTemplate rabbitTemplate,
            @Value("${medistock.rabbitmq.exchange:medistock.exchange}") String exchange,
            @Value("${medistock.rabbitmq.stock-low-routing-key:stock.low}") String routingKey) {
        this.rabbitTemplate = rabbitTemplate;
        this.exchange = exchange;
        this.routingKey = routingKey;
    }

    public void publish(LowStockAlertEventDto event) {
        rabbitTemplate.convertAndSend(exchange, routingKey, event);
    }
}
