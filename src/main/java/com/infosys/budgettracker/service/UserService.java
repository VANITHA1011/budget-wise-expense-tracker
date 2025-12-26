
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder; // use interface for autowiring

    public UserService(UserRepository userRepository, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    // Signup
    public UserEntity signup(String username, String email, String password, String role) throws Exception {
        if (userRepository.findByUsername(username).isPresent()) {
            throw new Exception("Username already exists");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new Exception("Email already exists");
        }

        UserEntity user = new UserEntity();
        user.setUsername(username);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role == null ? "USER" : role.toUpperCase());
        user.setActive(true);

        return userRepository.save(user);
    }

    // Login - returns JWT token string
    public String login(String username, String password) throws Exception {
        Optional<UserEntity> optionalUser = userRepository.findByUsername(username);
        if (optionalUser.isEmpty()) throw new Exception("User not found");

        UserEntity user = optionalUser.get();
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid Password");
        }

        // include role in token
        return jwtUtil.generateToken(username, user.getRole());
    }

    public String getUsernameFromToken(String token) {
        return jwtUtil.extractUsername(token);
    }
}

