package com.medistock.userservice.service;

import com.medistock.userservice.entity.User;
import com.medistock.userservice.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;


    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User register(User user) {

        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }
        user.setRole("USER");

        return userRepository.save(user);
    }

    public String login(String email, String password) {
        return "Login géré par Keycloak";
    }
}