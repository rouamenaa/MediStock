package com.esprit.microservice.orderservice.dto;

public class OrderCreatedEventDto {
    private Long orderId;
    private String orderNumber;
    private Long pharmacyId;
    private OrderLineEventDto[] items;

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public String getOrderNumber() {
        return orderNumber;
    }

    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }

    public Long getPharmacyId() {
        return pharmacyId;
    }

    public void setPharmacyId(Long pharmacyId) {
        this.pharmacyId = pharmacyId;
    }

    public OrderLineEventDto[] getItems() {
        return items;
    }

    public void setItems(OrderLineEventDto[] items) {
        this.items = items;
    }
}
