package com.esprit.microservice.orderservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class OrderServiceApplication {

    public static void main(String[] args) {
        System.setProperty("server.port", "8084");
        SpringApplication application = new SpringApplication(OrderServiceApplication.class);
        application.setAddCommandLineProperties(false);
        application.run(args);
    }

}
