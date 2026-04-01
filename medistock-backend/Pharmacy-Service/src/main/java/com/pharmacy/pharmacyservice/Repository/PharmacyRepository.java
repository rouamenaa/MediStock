package com.pharmacy.pharmacyservice.Repository;

import com.pharmacy.pharmacyservice.Model.Pharmacy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PharmacyRepository extends JpaRepository<Pharmacy, Long> {}