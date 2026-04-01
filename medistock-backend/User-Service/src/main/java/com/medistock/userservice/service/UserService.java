package com.medistock.userservice.service;

import com.medistock.userservice.entity.User;
import com.medistock.userservice.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    // ✅ CONSTRUCTEUR (IMPORTANT)
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User create(User user) {
        return userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id).orElse(null);
    }
}