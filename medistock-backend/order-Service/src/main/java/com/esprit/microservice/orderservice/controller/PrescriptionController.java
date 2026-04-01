package com.esprit.microservice.orderservice.controller;


import com.esprit.microservice.orderservice.entity.Prescription;
import com.esprit.microservice.orderservice.entity.PrescriptionStatus;

import com.esprit.microservice.orderservice.service.PrescriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/prescriptions")
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService PrescriptionService;

    // ── POST /api/prescriptions ────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Prescription> createPrescription(@RequestBody Prescription prescription) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(PrescriptionService.createPrescription(prescription));
    }

    // ── GET /api/prescriptions ─────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Prescription>> getAllPrescriptions() {
        return ResponseEntity.ok(PrescriptionService.getAllPrescriptions());
    }

    // ── GET /api/prescriptions/{id} ────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Prescription> getPrescriptionById(@PathVariable Long id) {
        return ResponseEntity.ok(PrescriptionService.getPrescriptionById(id));
    }

    // ── GET /api/prescriptions/number/{number} ─────────────────────────────────
    @GetMapping("/number/{number}")
    public ResponseEntity<Prescription> getPrescriptionByNumber(@PathVariable String number) {
        return ResponseEntity.ok(PrescriptionService.getPrescriptionByNumber(number));
    }

    // ── GET /api/prescriptions/patient/{patientId} ─────────────────────────────
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(PrescriptionService.getPrescriptionsByPatient(patientId));
    }

    // ── GET /api/prescriptions/status/{status} ─────────────────────────────────
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Prescription>> getPrescriptionsByStatus(@PathVariable PrescriptionStatus status) {
        return ResponseEntity.ok(PrescriptionService.getPrescriptionsByStatus(status));
    }

    // ── PUT /api/prescriptions/{id}/validate ───────────────────────────────────
    @PutMapping("/{id}/validate")
    public ResponseEntity<Prescription> validatePrescription(
            @PathVariable Long id,
            @RequestParam PrescriptionStatus status,
            @RequestParam(required = false) String validatedBy) {
        return ResponseEntity.ok(PrescriptionService.validatePrescription(id, status, validatedBy));
    }

    // ── PUT /api/prescriptions/{id}/cancel ─────────────────────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Prescription> cancelPrescription(@PathVariable Long id) {
        return ResponseEntity.ok(PrescriptionService.cancelPrescription(id));
    }

    // ── DELETE /api/prescriptions/{id} ─────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePrescription(@PathVariable Long id) {
        PrescriptionService.deletePrescription(id);
        return ResponseEntity.noContent().build();
    }
}