package com.medistock.pharmacystockservice.messaging;

import com.medistock.pharmacystockservice.dto.OrderCreatedEventDto;
import com.medistock.pharmacystockservice.dto.OrderLineEventDto;
import com.medistock.pharmacystockservice.service.StockItemService;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

@Component
public class OrderCreatedConsumer {
    private final StockItemService stockItemService;

    public OrderCreatedConsumer(StockItemService stockItemService) {
        this.stockItemService = stockItemService;
    }

    @RabbitListener(queues = "${medistock.rabbitmq.stock-order-created-queue:stock.order.created.queue}")
    public void onOrderCreated(OrderCreatedEventDto event) {
        if (event == null || event.getItems() == null) {
            return;
        }
        for (OrderLineEventDto item : event.getItems()) {
            if (item != null && item.getMedicationId() != null && item.getQuantity() > 0) {
                stockItemService.consumeByPharmacyAndMedication(
                        event.getPharmacyId(),
                        item.getMedicationId(),
                        item.getQuantity(),
                        event.getOrderNumber());
            }
        }
    }
}
