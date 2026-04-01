package com.medistock.userservice.controller;

import com.medistock.userservice.entity.User;
import com.medistock.userservice.service.AuthService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    // ✅ CONSTRUCTEUR (IMPORTANT)
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public User register(@RequestBody User user) {
        return authService.register(user);
    }

    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {
        String token = authService.login(user.getEmail(), user.getPassword());
        return Map.of("token", token);
    }
}