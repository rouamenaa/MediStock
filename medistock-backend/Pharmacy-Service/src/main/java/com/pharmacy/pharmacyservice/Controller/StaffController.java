package com.pharmacy.pharmacyservice.Controller;

import com.pharmacy.pharmacyservice.Model.Staff;
import com.pharmacy.pharmacyservice.Service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/staff")
public class StaffController {

    @Autowired
    private StaffService service;

    @GetMapping
    public List<Staff> getAll() { return service.getAll(); }

    @GetMapping("/{id}")  // ← manquait
    public Staff getById(@PathVariable Long id) { return service.getById(id); }

    @PostMapping
    public Staff add(@RequestBody Staff s) { return service.save(s); }

    @PutMapping("/{id}")  // ← manquait
    public Staff update(@PathVariable Long id, @RequestBody Staff s) {
        return service.update(id, s);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) { service.delete(id); }
}