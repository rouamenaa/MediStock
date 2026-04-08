package com.medistock.pharmacystockservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;


@SpringBootApplication
@EnableDiscoveryClient
public class PharmacyStockServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(PharmacyStockServiceApplication.class, args);
    }

}
