package com.medistock.pharmacystockservice.dto;

public class MedicationExistenceResponse {
    private Long medicationId;
    private boolean exists;

    public MedicationExistenceResponse() {
    }

    public MedicationExistenceResponse(Long medicationId, boolean exists) {
        this.medicationId = medicationId;
        this.exists = exists;
    }

    public Long getMedicationId() {
        return medicationId;
    }

    public void setMedicationId(Long medicationId) {
        this.medicationId = medicationId;
    }

    public boolean isExists() {
        return exists;
    }

    public void setExists(boolean exists) {
        this.exists = exists;
    }
}
