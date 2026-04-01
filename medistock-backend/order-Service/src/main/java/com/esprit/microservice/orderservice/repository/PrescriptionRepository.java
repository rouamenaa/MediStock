package com.esprit.microservice.orderservice.repository;

import com.esprit.microservice.orderservice.entity.Prescription;
import com.esprit.microservice.orderservice.entity.PrescriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrescriptionRepository extends JpaRepository<Prescription, Long> {

    Optional<Prescription> findByPrescriptionNumber(String prescriptionNumber);

    List<Prescription> findByPatientId(String patientId);

    List<Prescription> findByDoctorName(String doctorName);

    List<Prescription> findByStatus(PrescriptionStatus status);

    List<Prescription> findByPatientIdAndStatus(String patientId, PrescriptionStatus status);

    List<Prescription> findByExpiryDateBeforeAndStatus(LocalDate date, PrescriptionStatus status);

    boolean existsByPrescriptionNumber(String prescriptionNumber);
}