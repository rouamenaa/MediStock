package com.pharmacy.pharmacyservice.Controller;

import com.pharmacy.pharmacyservice.Model.Pharmacy;
import com.pharmacy.pharmacyservice.Service.PharmacyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/pharmacies")
public class PharmacyController {

    @Autowired
    private PharmacyService service;

    @GetMapping
    public List<Pharmacy> getAll() { return service.getAll(); }

    @GetMapping("/{id}")  // ← manquait
    public Pharmacy getById(@PathVariable Long id) { return service.getById(id); }

    @PostMapping
    public Pharmacy add(@RequestBody Pharmacy p) { return service.save(p); }

    @PutMapping("/{id}")
    public Pharmacy update(@PathVariable Long id, @RequestBody Pharmacy p) {
        return service.update(id, p);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}