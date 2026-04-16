package com.esprit.microservice.orderservice.client;

import com.esprit.microservice.orderservice.dto.OrderDocumentGenerationRequestDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "document-service-client", url = "${document.service.url:http://localhost:8091}", path = "/documents")
public interface DocumentServiceClient {
    @PostMapping("/events/order-created")
    void generateOrderDocument(@RequestBody OrderDocumentGenerationRequestDto payload);
}
