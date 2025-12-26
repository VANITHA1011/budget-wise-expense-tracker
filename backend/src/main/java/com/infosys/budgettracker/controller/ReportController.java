
package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.service.JwtUtil;
import com.infosys.budgettracker.service.ReportService; // Import the new service
import com.infosys.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/reports") // Changed from /api/transactions/summary
public class ReportController {

    @Autowired private ReportService reportService;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private UserRepository userRepository;

    private UserEntity getUserFromToken(String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));
    }

    /**
     * GET /api/reports/category-summary?months=3
     * Returns data for a Pie Chart (Category Spending)
     */
    @GetMapping("/category-summary")
    public ResponseEntity<Map<String, Double>> getCategorySummary(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "1") int months) {
        try {
            UserEntity user = getUserFromToken(authHeader);
            Map<String, Double> summary = reportService.getCategorySummary(user, months);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            System.err.println("Report Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", 0.0));
        }
    }
    
    /**
     * GET /api/reports/monthly-trend?months=6
     * Returns data for a Bar Chart (Income vs Expense over time)
     */
    @GetMapping("/monthly-trend")
    public ResponseEntity<Map<String, Map<String, Double>>> getMonthlyTrend(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam(defaultValue = "6") int months) {
        try {
            UserEntity user = getUserFromToken(authHeader);
            Map<String, Map<String, Double>> trend = reportService.getMonthlyTrend(user, months);
            return ResponseEntity.ok(trend);
        } catch (Exception e) {
            System.err.println("Report Error: " + e.getMessage());
            return ResponseEntity.internalServerError().body(null);
        }
    }
}
