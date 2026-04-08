package com.esprit.microservice.orderservice.service;

import com.esprit.microservice.orderservice.entity.Order;
import com.esprit.microservice.orderservice.entity.OrderItem;
import com.esprit.microservice.orderservice.entity.OrderStatus;
import com.esprit.microservice.orderservice.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderService {

    // ✅ Logger manuel (remplace @Slf4j)
    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    // ✅ @Autowired (remplace @RequiredArgsConstructor + final)
    @Autowired
    private OrderRepository orderRepository;

    public Order createOrder(Order order) {
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItem> items = new ArrayList<>(order.getItems());
            order.getItems().clear();

            BigDecimal total = BigDecimal.ZERO;
            for (OrderItem item : items) {
                if (item.getUnitPrice() != null && item.getQuantity() != null) {
                    BigDecimal subTotal = item.getUnitPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));
                    item.setTotalPrice(subTotal);
                    total = total.add(subTotal);
                } else {
                    item.setTotalPrice(BigDecimal.ZERO);
                }
                order.addItem(item);
            }
            order.setTotalAmount(total);
        } else {
            order.setTotalAmount(BigDecimal.ZERO);
        }

        Order saved = orderRepository.save(order);
        log.info("Commande créée : {}", saved.getOrderNumber());
        return saved;
    }

    @Transactional(readOnly = true)
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande introuvable avec l'id : " + id));
    }

    @Transactional(readOnly = true)
    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Commande introuvable : " + orderNumber));
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByPatient(String patientId) {
        return orderRepository.findByPatientId(patientId);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByPharmacy(Long pharmacyId) {
        return orderRepository.findByPharmacyId(pharmacyId);
    }

    @Transactional(readOnly = true)
    public List<Order> getOrdersByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }

    public Order updateStatus(Long id, OrderStatus newStatus) {
        Order order = getOrderById(id);
        validateTransition(order.getStatus(), newStatus);
        order.setStatus(newStatus);
        log.info("Statut commande {} → {}", order.getOrderNumber(), newStatus);
        return orderRepository.save(order);
    }

    public Order cancelOrder(Long id) {
        Order order = getOrderById(id);
        if (order.getStatus() == OrderStatus.DELIVERED
                || order.getStatus() == OrderStatus.CANCELLED) {
            throw new RuntimeException(
                    "Impossible d'annuler une commande en statut : " + order.getStatus());
        }
        order.setStatus(OrderStatus.CANCELLED);
        return orderRepository.save(order);
    }

    public void deleteOrder(Long id) {
        orderRepository.delete(getOrderById(id));
        log.info("Commande {} supprimée", id);
    }

    private String generateOrderNumber() {
        String number;
        do {
            number = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        } while (orderRepository.existsByOrderNumber(number));
        return number;
    }

    private void validateTransition(OrderStatus current, OrderStatus next) {
        boolean valid = switch (current) {
            case PENDING    -> next == OrderStatus.CONFIRMED
                    || next == OrderStatus.CANCELLED
                    || next == OrderStatus.REJECTED;
            case CONFIRMED  -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.READY      || next == OrderStatus.CANCELLED;
            case READY      -> next == OrderStatus.DELIVERED  || next == OrderStatus.CANCELLED;
            default         -> false;
        };
        if (!valid) {
            throw new RuntimeException("Transition invalide : " + current + " → " + next);
        }
    }
}