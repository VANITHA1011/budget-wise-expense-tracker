package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.service.UserService;
import com.infosys.budgettracker.repository.UserRepository;
import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class TestController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Getter @Setter
    public static class SignupRequest {
        private String username;
        private String email;
        private String password;
        private String role;
    }

    @Getter @Setter
    public static class LoginRequest {
        private String username;
        private String password;
    }

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignupRequest signupRequest) {
        try {
            UserEntity saved = userService.signup(
                    signupRequest.getUsername(),
                    signupRequest.getEmail(),
                    signupRequest.getPassword(),
                    signupRequest.getRole()
            );
            return ResponseEntity.ok(Map.of("message", "User registered successfully", "username", saved.getUsername()));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            String token = userService.login(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
            );

            // find role from DB to return in response
            Optional<UserEntity> opt = userRepository.findByUsername(loginRequest.getUsername());
            String role = opt.map(UserEntity::getRole).orElse("USER");

            return ResponseEntity.ok(Map.of(
                    "token", token,
                    "username", loginRequest.getUsername(),
                    "role", role
            ));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", e.getMessage()));
        }
    }

    // Protected profile endpoint
    @GetMapping("/profile")
    public ResponseEntity<String> profile(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.substring(7); // remove Bearer
            String username = userService.getUsernameFromToken(token);
            return ResponseEntity.ok("Hello, " + username + "! This is your profile.");
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }
}

