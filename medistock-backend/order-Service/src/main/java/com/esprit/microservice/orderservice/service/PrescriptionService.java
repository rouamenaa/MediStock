package com.esprit.microservice.orderservice.service;

import com.esprit.microservice.orderservice.entity.Prescription;
import com.esprit.microservice.orderservice.entity.PrescriptionItem;
import com.esprit.microservice.orderservice.entity.PrescriptionStatus;
import com.esprit.microservice.orderservice.repository.PrescriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;

    public Prescription createPrescription(Prescription prescription) {
        prescription.setPrescriptionNumber(generatePrescriptionNumber());
        prescription.setStatus(PrescriptionStatus.PENDING_VALIDATION);

        if (prescription.getItems() != null && !prescription.getItems().isEmpty()) {
            List<PrescriptionItem> items = prescription.getItems();
            prescription.getItems().clear();
            items.forEach(prescription::addItem);
        }

        Prescription saved = prescriptionRepository.save(prescription);
        log.info("Prescription créée : {}", saved.getPrescriptionNumber());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Prescription> getAllPrescriptions() {
        return prescriptionRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Prescription getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prescription introuvable, id : " + id));
    }

    @Transactional(readOnly = true)
    public Prescription getPrescriptionByNumber(String number) {
        return prescriptionRepository.findByPrescriptionNumber(number)
                .orElseThrow(() -> new RuntimeException("Prescription introuvable : " + number));
    }

    @Transactional(readOnly = true)
    public List<Prescription> getPrescriptionsByPatient(String patientId) {
        return prescriptionRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public List<Prescription> getPrescriptionsByStatus(PrescriptionStatus status) {
        return prescriptionRepository.findByStatus(status);
    }

    public Prescription validatePrescription(Long id, PrescriptionStatus status, String validatedBy) {
        Prescription prescription = getPrescriptionById(id);
        if (prescription.getStatus() != PrescriptionStatus.PENDING_VALIDATION) {
            throw new RuntimeException("La prescription n'est pas en attente de validation");
        }
        prescription.setStatus(status);
        prescription.setValidatedBy(validatedBy);
        prescription.setValidatedAt(LocalDateTime.now());
        log.info("Prescription {} → {}", prescription.getPrescriptionNumber(), status);
        return prescriptionRepository.save(prescription);
    }

    public Prescription cancelPrescription(Long id) {
        Prescription prescription = getPrescriptionById(id);
        if (prescription.getStatus() == PrescriptionStatus.USED) {
            throw new RuntimeException("Impossible d'annuler une prescription déjà utilisée");
        }
        prescription.setStatus(PrescriptionStatus.CANCELLED);
        return prescriptionRepository.save(prescription);
    }

    public void deletePrescription(Long id) {
        Prescription prescription = getPrescriptionById(id);
        if (prescription.getStatus() == PrescriptionStatus.USED) {
            throw new RuntimeException("Impossible de supprimer une prescription utilisée");
        }
        prescriptionRepository.delete(prescription);
        log.info("Prescription {} supprimée", id);
    }

    @Scheduled(cron = "0 0 0 * * *")
    public void expirePrescriptions() {
        List<Prescription> toExpire = prescriptionRepository
                .findByExpiryDateBeforeAndStatus(LocalDate.now(), PrescriptionStatus.VALID);
        toExpire.forEach(p -> p.setStatus(PrescriptionStatus.EXPIRED));
        prescriptionRepository.saveAll(toExpire);
        log.info("{} prescription(s) expirée(s)", toExpire.size());
    }

    private String generatePrescriptionNumber() {
        String n;
        do {
            n = "RX-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (prescriptionRepository.existsByPrescriptionNumber(n));
        return n;
    }
}