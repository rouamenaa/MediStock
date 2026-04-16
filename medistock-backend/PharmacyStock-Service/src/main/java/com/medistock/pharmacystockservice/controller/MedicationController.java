package com.medistock.pharmacystockservice.controller;

import com.medistock.pharmacystockservice.entity.Medication;
import com.medistock.pharmacystockservice.repository.MedicationRepository;
//import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/medications")
//@CrossOrigin(origins = "http://localhost:4200")
public class MedicationController {

    private final MedicationRepository medicationRepository;

    public MedicationController(MedicationRepository medicationRepository) {
        this.medicationRepository = medicationRepository;
    }

    @GetMapping
    public List<Medication> getAll() {
        return medicationRepository.findAll();
    }
}
