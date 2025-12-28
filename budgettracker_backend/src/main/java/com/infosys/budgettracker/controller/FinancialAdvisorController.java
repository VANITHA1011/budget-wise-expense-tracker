
package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.dto.InsightDTO;
import com.infosys.budgettracker.repository.UserRepository;
import com.infosys.budgettracker.service.FinancialAdvisorService;
import com.infosys.budgettracker.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

@RestController
@RequestMapping("/api/advisor")
@CrossOrigin(origins = "http://localhost:5173") // Ensure your frontend origin is correct
public class FinancialAdvisorController {

    @Autowired
    private FinancialAdvisorService advisorService;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtil jwtUtil;

    @GetMapping("/insights")
    public ResponseEntity<InsightDTO> getFinancialInsights(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);

            // Fetch the UserEntity based on the token
            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found: " + username));

            // Call the service's combined method
            InsightDTO insights = advisorService.generateFinancialInsights(user);
            
            return ResponseEntity.ok(insights);
        } catch (Exception e) {
            System.err.println("Financial Insight Error: " + e.getMessage());
            // Return an empty DTO on failure
            return ResponseEntity.status(401).body(new InsightDTO(Collections.emptyList(), Collections.emptyList()));
        }
    }
}