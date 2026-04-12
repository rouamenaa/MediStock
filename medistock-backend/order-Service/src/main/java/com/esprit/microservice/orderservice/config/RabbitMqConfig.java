package com.esprit.microservice.orderservice.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    @Bean
    public DirectExchange medistockExchange(
            @Value("${medistock.rabbitmq.exchange:medistock.exchange}") String exchangeName) {
        return new DirectExchange(exchangeName);
    }

    @Bean
    public Queue stockOrderCreatedQueue(
            @Value("${medistock.rabbitmq.stock-order-created-queue:stock.order.created.queue}") String queueName) {
        return QueueBuilder.durable(queueName).build();
    }

    @Bean
    public Binding orderCreatedBinding(
            Queue stockOrderCreatedQueue,
            DirectExchange medistockExchange,
            @Value("${medistock.rabbitmq.order-created-routing-key:order.created}") String routingKey) {
        return BindingBuilder.bind(stockOrderCreatedQueue).to(medistockExchange).with(routingKey);
    }
}
