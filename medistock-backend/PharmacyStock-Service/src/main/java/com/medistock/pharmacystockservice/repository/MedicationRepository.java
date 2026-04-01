package com.medistock.pharmacystockservice.repository;

import com.medistock.pharmacystockservice.entity.Medication;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MedicationRepository
        extends JpaRepository<Medication, Long> {
}
