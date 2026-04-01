package com.esprit.microservice.orderservice.repository;


import com.esprit.microservice.orderservice.entity.Order;
import com.esprit.microservice.orderservice.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {

    Optional<Order> findByOrderNumber(String orderNumber);

    List<Order> findByPatientId(String patientId);

    List<Order> findByPharmacyId(Long pharmacyId);

    List<Order> findByStatus(OrderStatus status);

    List<Order> findByPharmacyIdAndStatus(Long pharmacyId, OrderStatus status);

    List<Order> findByPatientIdAndStatus(String patientId, OrderStatus status);

    boolean existsByOrderNumber(String orderNumber);
}