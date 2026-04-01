package com.pharmacy.pharmacyservice.Model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.List;

@Entity
public class Pharmacy {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String address;
    private String phone;

    @OneToMany(mappedBy = "pharmacy", cascade = CascadeType.ALL)
    @JsonIgnore  // ← empêche la boucle infinie JSON
    private List<Staff> staffList;

    // ===== GETTERS & SETTERS =====

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public List<Staff> getStaffList() { return staffList; }
    public void setStaffList(List<Staff> staffList) { this.staffList = staffList; }
}