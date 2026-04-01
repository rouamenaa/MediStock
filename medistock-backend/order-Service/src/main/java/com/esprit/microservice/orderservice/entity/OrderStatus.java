package com.esprit.microservice.orderservice.entity;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    PROCESSING,
    READY,
    DELIVERED,
    CANCELLED,
    REJECTED
}