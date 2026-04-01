package com.pharmacy.pharmacyservice.Service;

import com.pharmacy.pharmacyservice.Model.Pharmacy;
import com.pharmacy.pharmacyservice.Repository.PharmacyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PharmacyService {

    @Autowired
    private PharmacyRepository repo;

    public List<Pharmacy> getAll() { return repo.findAll(); }

    public Pharmacy getById(Long id) { return repo.findById(id).orElseThrow(); } // ← manquait

    public Pharmacy save(Pharmacy p) { return repo.save(p); }

    public Pharmacy update(Long id, Pharmacy p) {
        Pharmacy old = repo.findById(id).orElseThrow();
        old.setName(p.getName());
        old.setAddress(p.getAddress());
        old.setPhone(p.getPhone());
        return repo.save(old);
    }

    public void delete(Long id) { repo.deleteById(id); }
}