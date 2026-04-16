package com.medistock.catalog;

import com.medistock.catalog.messaging.CatalogRabbitProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
@EnableConfigurationProperties(CatalogRabbitProperties.class)
public class MedicationCatalogServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(MedicationCatalogServiceApplication.class, args);
    }
}
