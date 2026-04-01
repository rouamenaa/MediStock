package com.pharmacy.pharmacyservice.Repository;

import com.pharmacy.pharmacyservice.Model.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {}