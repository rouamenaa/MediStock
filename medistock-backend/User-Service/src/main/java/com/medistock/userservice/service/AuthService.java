package com.medistock.userservice.service;

import com.medistock.userservice.entity.User;
import com.medistock.userservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;


    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.setRole("USER");

        return userRepository.save(user);
    }

    public String login(String email, String password) {
        return "Login géré par Keycloak";
    }
}