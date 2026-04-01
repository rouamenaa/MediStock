package com.esprit.microservice.orderservice.entity;

public enum PrescriptionStatus {
    PENDING_VALIDATION,
    VALID,
    EXPIRED,
    USED,
    REJECTED,
    CANCELLED
}