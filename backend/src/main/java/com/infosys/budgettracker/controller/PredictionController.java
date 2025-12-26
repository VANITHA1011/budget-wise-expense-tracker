

package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.service.JwtUtil;
import com.infosys.budgettracker.service.PredictionService;
import com.infosys.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class PredictionController {

    @Autowired private PredictionService predictionService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    /**
     * Endpoint for AI Feature: Predict next month's expenses.
     * Accessible via GET: /api/ai/predict-expenses
     * Response body includes: { "total_predicted_expense": 1234.56, "message": "..." }
     */
    @GetMapping("/predict-expenses")
    public ResponseEntity<Map<String, Object>> getExpensePrediction(@RequestHeader("Authorization") String authHeader) {
        try {
            // Extract username from JWT
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);
            
            // Fetch User
            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found"));

            // Get Prediction from the Service
            Map<String, Object> prediction = predictionService.predictNextMonthExpenses(user);
            
            return ResponseEntity.ok(prediction);
            
        } catch (Exception e) {
            System.err.println("Prediction error: " + e.getMessage());
            // Return a safe, empty result on error
            return ResponseEntity.internalServerError().body(Map.of("total_predicted_expense", 0.0, "message", "Error fetching AI prediction."));
        }
    }
}