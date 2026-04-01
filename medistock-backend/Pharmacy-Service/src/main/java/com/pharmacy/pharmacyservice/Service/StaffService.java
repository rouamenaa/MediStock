package com.pharmacy.pharmacyservice.Service;

import com.pharmacy.pharmacyservice.Model.Staff;
import com.pharmacy.pharmacyservice.Repository.StaffRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class StaffService {

    @Autowired
    private StaffRepository repo;

    public List<Staff> getAll() { return repo.findAll(); }

    public Staff getById(Long id) { return repo.findById(id).orElseThrow(); } // ← manquait

    public Staff save(Staff s) { return repo.save(s); }

    public Staff update(Long id, Staff s) { // ← manquait
        Staff old = repo.findById(id).orElseThrow();
        old.setFullName(s.getFullName());
        old.setRole(s.getRole());
        old.setPhone(s.getPhone());
        old.setPharmacy(s.getPharmacy());
        return repo.save(old);
    }

    public void delete(Long id) { repo.deleteById(id); }
}
