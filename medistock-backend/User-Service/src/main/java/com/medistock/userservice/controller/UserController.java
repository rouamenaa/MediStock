package com.medistock.userservice.controller;

import com.medistock.userservice.entity.User;
import com.medistock.userservice.repository.UserRepository;
import com.medistock.userservice.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository repo;


    public UserController(UserRepository repo) {
        this.repo = repo;


   // public UserController(UserService userService) {
      //  this.userService = userService;

    }

    @PostMapping("/sync")
    public User syncUser(@AuthenticationPrincipal Jwt jwt) {

        String email = jwt.getClaim("email");
        String role = jwt.getClaim("userType"); // ✅ YOUR ATTRIBUTE

        Optional<User> existing = repo.findByEmail(email);

        if (existing.isPresent()) {
            User user = existing.get();
            user.setRole(role);
            return repo.save(user);
        }

        User user = new User();
        user.setEmail(email);
        user.setUsername(jwt.getClaim("preferred_username"));
        user.setRole(role);

        return repo.save(user);
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal Jwt jwt) {

        Map<String, Object> realmAccess = jwt.getClaim("realm_access");
        List<String> roles = (List<String>) realmAccess.get("roles");

        return Map.of(
                "username", jwt.getClaim("preferred_username"),
                "email", jwt.getClaim("email"),
                "role", roles.get(0)
        );
    }
}