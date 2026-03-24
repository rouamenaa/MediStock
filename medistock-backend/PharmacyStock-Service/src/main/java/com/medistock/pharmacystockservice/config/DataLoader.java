package com.medistock.pharmacystockservice.config;

import com.medistock.pharmacystockservice.entity.Medication;
import com.medistock.pharmacystockservice.repository.MedicationRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner load(MedicationRepository repo) {
        return args -> {

            if (repo.count() == 0) {

                repo.save(new Medication(null, "Paracetamol", "500mg"));
                repo.save(new Medication(null, "Ibuprofen", "400mg"));
                repo.save(new Medication(null, "Amoxicillin", "1g"));

            }

        };
    }
}