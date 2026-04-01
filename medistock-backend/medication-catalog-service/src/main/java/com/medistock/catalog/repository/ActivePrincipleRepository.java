package com.medistock.catalog.repository;

import com.medistock.catalog.domain.ActivePrinciple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ActivePrincipleRepository extends JpaRepository<ActivePrinciple, Long> {

    Optional<ActivePrinciple> findByCode(String code);

    List<ActivePrinciple> findByNameContainingIgnoreCase(String name);

    @Query("SELECT ap FROM ActivePrinciple ap WHERE LOWER(ap.name) LIKE LOWER(CONCAT('%', :query, '%')) OR LOWER(ap.code) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<ActivePrinciple> searchByNameOrCode(String query);
}
