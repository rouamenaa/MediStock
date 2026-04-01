package com.esprit.microservice.orderservice.controller;

import com.esprit.microservice.orderservice.entity.Order;
import com.esprit.microservice.orderservice.entity.OrderStatus;
import com.esprit.microservice.orderservice.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin(origins = "http://localhost:4200")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    // ✅ minuscule : orderService (pas OrderService)
    private final OrderService orderService;

    // ── POST /api/orders ───────────────────────────────────────────────────────
    @PostMapping
    public ResponseEntity<Order> createOrder(@RequestBody Order order) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(order));
    }

    // ── GET /api/orders ────────────────────────────────────────────────────────
    @GetMapping
    public ResponseEntity<List<Order>> getAllOrders() {
        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // ── GET /api/orders/{id} ───────────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.getOrderById(id));
    }

    // ── GET /api/orders/number/{orderNumber} ───────────────────────────────────
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }

    // ── GET /api/orders/patient/{patientId} ────────────────────────────────────
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Order>> getOrdersByPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(orderService.getOrdersByPatient(patientId));
    }

    // ── GET /api/orders/pharmacy/{pharmacyId} ──────────────────────────────────
    @GetMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<List<Order>> getOrdersByPharmacy(@PathVariable Long pharmacyId) {
        return ResponseEntity.ok(orderService.getOrdersByPharmacy(pharmacyId));
    }

    // ── GET /api/orders/status/{status} ───────────────────────────────────────
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(orderService.getOrdersByStatus(status));
    }

    // ── PUT /api/orders/{id}/status ────────────────────────────────────────────
    @PutMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        return ResponseEntity.ok(orderService.updateStatus(id, status));
    }

    // ── PUT /api/orders/{id}/cancel ────────────────────────────────────────────
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.cancelOrder(id));
    }

    // ── DELETE /api/orders/{id} ────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        orderService.deleteOrder(id);
        return ResponseEntity.noContent().build();
    }
}