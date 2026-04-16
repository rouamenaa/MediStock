package com.esprit.microservice.orderservice.service;

import com.esprit.microservice.orderservice.client.DocumentServiceClient;
import com.esprit.microservice.orderservice.client.MedicationCatalogClient;
import com.esprit.microservice.orderservice.client.PharmacyManagementClient;
import com.esprit.microservice.orderservice.dto.MedicationCatalogDto;
import com.esprit.microservice.orderservice.dto.OrderCreatedEventDto;
import com.esprit.microservice.orderservice.dto.OrderDocumentGenerationRequestDto;
import com.esprit.microservice.orderservice.dto.OrderDocumentLineDto;
import com.esprit.microservice.orderservice.dto.OrderLineEventDto;
import com.esprit.microservice.orderservice.entity.Order;
import com.esprit.microservice.orderservice.entity.OrderItem;
import com.esprit.microservice.orderservice.entity.OrderStatus;
import feign.FeignException;
import com.esprit.microservice.orderservice.messaging.OrderCreatedProducer;
import com.esprit.microservice.orderservice.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

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
    @Autowired
    private OrderCreatedProducer orderCreatedProducer;
    @Autowired
    private MedicationCatalogClient medicationCatalogClient;
    @Autowired
    private PharmacyManagementClient pharmacyManagementClient;
    @Autowired
    private DocumentServiceClient documentServiceClient;

    public Order createOrder(Order order) {
        validatePharmacy(order.getPharmacyId());
        order.setOrderNumber(generateOrderNumber());
        order.setStatus(OrderStatus.PENDING);

        if (order.getItems() != null && !order.getItems().isEmpty()) {
            List<OrderItem> items = new ArrayList<>(order.getItems());
            order.getItems().clear();

            BigDecimal total = BigDecimal.ZERO;
            for (OrderItem item : items) {
                MedicationCatalogDto medication = validateAndGetMedication(item);
                item.setMedicationId(medication.getId());
                item.setMedicationName(medication.getName());
                item.setMedicationCode(medication.getProductCode());
                if (medication.getDosage() != null && !medication.getDosage().isBlank()) {
                    item.setDosage(medication.getDosage());
                }
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
        try {
            orderCreatedProducer.publish(toOrderCreatedEvent(saved));
        } catch (Exception ex) {
            // Do not fail order creation when RabbitMQ is unavailable.
            log.error("Échec publication événement commande {}: {}", saved.getOrderNumber(), ex.getMessage());
        }
        generateDocumentForCreatedOrder(saved);
        // Prevent lazy collection serialization issues on HTTP response.
        saved.setItems(saved.getItems() == null ? new ArrayList<>() : new ArrayList<>(saved.getItems()));
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
            case PENDING -> next == OrderStatus.CONFIRMED
                    || next == OrderStatus.CANCELLED
                    || next == OrderStatus.REJECTED;
            case CONFIRMED -> next == OrderStatus.PROCESSING || next == OrderStatus.CANCELLED;
            case PROCESSING -> next == OrderStatus.READY || next == OrderStatus.CANCELLED;
            case READY -> next == OrderStatus.DELIVERED || next == OrderStatus.CANCELLED;
            default -> false;
        };
        if (!valid) {
            throw new RuntimeException("Transition invalide : " + current + " → " + next);
        }
    }

    private void validatePharmacy(Long pharmacyId) {
        if (pharmacyId == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "pharmacyId is required");
        }
        try {
            pharmacyManagementClient.getPharmacyById(pharmacyId);
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unknown pharmacyId: " + pharmacyId);
        } catch (FeignException ex) {
            // Do not block order creation when downstream service discovery is unstable.
            log.warn("Pharmacy validation skipped for pharmacyId {} due to downstream error: {}", pharmacyId, ex.getMessage());
        } catch (Exception ex) {
            log.warn("Pharmacy validation skipped for pharmacyId {} due to connectivity error: {}", pharmacyId, ex.getMessage());
        }
    }

    private MedicationCatalogDto validateAndGetMedication(OrderItem item) {
        if (item == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order item is required");
        }
        if (item.getQuantity() == null || item.getQuantity() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Item quantity must be greater than zero");
        }
        String productCode = item.getMedicationCode();
        String dosage = item.getDosage();

        if (productCode != null && !productCode.isBlank() && dosage != null && !dosage.isBlank()) {
            return lookupMedicationByProductCodeAndDosage(item, productCode, dosage);
        }
        if (item.getMedicationId() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Provide medicationCode and dosage, or medicationId");
        }
        return lookupMedicationById(item);
    }

    private MedicationCatalogDto lookupMedicationByProductCodeAndDosage(OrderItem item, String productCode, String dosage) {
        try {
            MedicationCatalogDto medication = medicationCatalogClient.getMedicationByProductCodeAndDosage(productCode, dosage);
            if (medication == null || medication.getId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unknown medication for productCode: " + productCode + ", dosage: " + dosage);
            }
            return medication;
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown medication for productCode: " + productCode + ", dosage: " + dosage);
        } catch (FeignException ex) {
            log.warn("Medication lookup skipped for productCode {} and dosage {} due to downstream error: {}",
                    productCode, dosage, ex.getMessage());
            return buildFallbackMedication(item);
        } catch (Exception ex) {
            log.warn("Medication lookup skipped for productCode {} and dosage {} due to connectivity error: {}",
                    productCode, dosage, ex.getMessage());
            return buildFallbackMedication(item);
        }
    }

    private MedicationCatalogDto lookupMedicationById(OrderItem item) {
        try {
            MedicationCatalogDto medication = medicationCatalogClient.getMedicationById(item.getMedicationId());
            if (medication == null || medication.getId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Unknown medicationId: " + item.getMedicationId());
            }
            return medication;
        } catch (FeignException.NotFound ex) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Unknown medicationId: " + item.getMedicationId());
        } catch (FeignException ex) {
            // Fallback to request payload when catalog lookup is temporarily unavailable.
            log.warn("Medication lookup skipped for medicationId {} due to downstream error: {}",
                    item.getMedicationId(), ex.getMessage());
            return buildFallbackMedication(item);
        } catch (Exception ex) {
            log.warn("Medication lookup skipped for medicationId {} due to connectivity error: {}",
                    item.getMedicationId(), ex.getMessage());
            return buildFallbackMedication(item);
        }
    }

    private MedicationCatalogDto buildFallbackMedication(OrderItem item) {
        MedicationCatalogDto fallback = new MedicationCatalogDto();
        fallback.setId(item.getMedicationId());
        fallback.setName((item.getMedicationName() == null || item.getMedicationName().isBlank())
                ? fallbackMedicationName(item)
                : item.getMedicationName());
        fallback.setProductCode(item.getMedicationCode());
        fallback.setDosage(item.getDosage());
        return fallback;
    }

    private String fallbackMedicationName(OrderItem item) {
        if (item.getMedicationCode() != null && !item.getMedicationCode().isBlank()) {
            String dosageSuffix = (item.getDosage() == null || item.getDosage().isBlank()) ? "" : " " + item.getDosage();
            return "Medication " + item.getMedicationCode() + dosageSuffix;
        }
        if (item.getMedicationId() != null) {
            return "Medication #" + item.getMedicationId();
        }
        return "Medication";
    }

    private OrderCreatedEventDto toOrderCreatedEvent(Order order) {
        OrderCreatedEventDto event = new OrderCreatedEventDto();
        event.setOrderId(order.getId());
        event.setOrderNumber(order.getOrderNumber());
        event.setPharmacyId(order.getPharmacyId());
        List<OrderItem> orderItems = order.getItems();
        if (orderItems == null || orderItems.isEmpty()) {
            event.setItems(new OrderLineEventDto[0]);
            return event;
        }
        OrderLineEventDto[] lines = new OrderLineEventDto[orderItems.size()];
        for (int i = 0; i < orderItems.size(); i++) {
            OrderItem item = orderItems.get(i);
            OrderLineEventDto line = new OrderLineEventDto();
            line.setMedicationId(item.getMedicationId());
            line.setQuantity(item.getQuantity() == null ? 0 : item.getQuantity());
            lines[i] = line;
        }
        event.setItems(lines);
        return event;
    }

    private void generateDocumentForCreatedOrder(Order order) {
        try {
            documentServiceClient.generateOrderDocument(toOrderDocumentGenerationRequest(order));
        } catch (Exception ex) {
            log.error("Échec génération document pour commande {}: {}", order.getOrderNumber(), ex.getMessage());
        }
    }

    private OrderDocumentGenerationRequestDto toOrderDocumentGenerationRequest(Order order) {
        OrderDocumentGenerationRequestDto request = new OrderDocumentGenerationRequestDto();
        request.setOrderId(order.getId());
        request.setOrderNumber(order.getOrderNumber());
        request.setPatientId(order.getPatientId());
        request.setPatientName(order.getPatientName());
        request.setPharmacyId(order.getPharmacyId());
        request.setStatus(order.getStatus() == null ? null : order.getStatus().name());
        request.setTotalAmount(order.getTotalAmount());
        request.setCreatedAt(order.getCreatedAt() == null ? null : order.getCreatedAt().toString());

        List<OrderItem> orderItems = order.getItems();
        List<OrderDocumentLineDto> lines = new ArrayList<>();
        if (orderItems != null) {
            for (OrderItem item : orderItems) {
                OrderDocumentLineDto line = new OrderDocumentLineDto();
                line.setMedicationId(item.getMedicationId());
                line.setMedicationName(item.getMedicationName());
                line.setMedicationCode(item.getMedicationCode());
                line.setQuantity(item.getQuantity());
                line.setUnitPrice(item.getUnitPrice());
                line.setTotalPrice(item.getTotalPrice());
                lines.add(line);
            }
        }
        request.setItems(lines);
        return request;
    }
}
