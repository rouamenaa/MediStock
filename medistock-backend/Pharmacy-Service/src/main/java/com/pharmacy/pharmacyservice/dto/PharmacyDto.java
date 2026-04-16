package com.pharmacy.pharmacyservice.dto;

public class PharmacyDto {
    private String name;
    private String address;
    private String phone;          // Ajout du champ phone
    private Long adminUserId;

    // Constructeur par défaut
    public PharmacyDto() {}

    // Constructeur avec tous les champs
    public PharmacyDto(String name, String address, String phone, Long adminUserId) {
        this.name = name;
        this.address = address;
        this.phone = phone;
        this.adminUserId = adminUserId;
    }

    // Getters et Setters
    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Long getAdminUserId() {
        return adminUserId;
    }

    public void setAdminUserId(Long adminUserId) {
        this.adminUserId = adminUserId;
    }
}