package com.medistock.catalog.repository;

import com.medistock.catalog.domain.Medication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface MedicationRepository extends JpaRepository<Medication, Long> {

    long countByActivePrincipleId(Long activePrincipleId);

    List<Medication> findByNameContainingIgnoreCaseAndActiveTrue(String name);

    List<Medication> findByActivePrincipleIdAndActiveTrue(Long activePrincipleId);

    List<Medication> findByReferenceMedicationIdAndActiveTrue(Long referenceMedicationId);

    /** Tous les médicaments (actifs ou non) dont la référence générique pointe vers cet ID */
    List<Medication> findByReferenceMedicationId(Long referenceMedicationId);

    @Query("SELECT m FROM Medication m JOIN m.activePrinciple ap WHERE (LOWER(ap.name) LIKE LOWER(CONCAT('%', :activePrincipleQuery, '%')) OR LOWER(ap.code) LIKE LOWER(CONCAT('%', :activePrincipleQuery, '%'))) AND m.active = true")
    List<Medication> findByActivePrincipleNameOrCode(@Param("activePrincipleQuery") String activePrincipleQuery);

    @Query("SELECT m FROM Medication m JOIN m.categories c WHERE c.id = :categoryId AND m.active = true")
    List<Medication> findByCategoryId(@Param("categoryId") Long categoryId);
}
