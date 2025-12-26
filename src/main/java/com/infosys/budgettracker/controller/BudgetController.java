
package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.BudgetEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.BudgetRepository;
import com.infosys.budgettracker.repository.UserRepository;
import com.infosys.budgettracker.service.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetRepository budgetRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public BudgetController(BudgetRepository budgetRepository,
                            UserRepository userRepository,
                            JwtUtil jwtUtil) {
        this.budgetRepository = budgetRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    // 📌 FIXED ➜ GET all budgets for dashboard
    @GetMapping
    public ResponseEntity<?> getUserBudgets(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);

            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found"));

            return ResponseEntity.ok(budgetRepository.findByUser(user));

        } catch (Exception e) {
            return ResponseEntity.status(403).body("Access denied: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> saveBudget(@RequestBody BudgetEntity req,
                                        @RequestHeader("Authorization") String authHeader) throws Exception {

        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        BudgetEntity budget = budgetRepository
                .findByUserAndCategoryAndYearAndMonth(user, req.getCategory(), req.getYear(), req.getMonth())
                .orElse(new BudgetEntity());

        budget.setUser(user);
        budget.setCategory(req.getCategory());
        budget.setYear(req.getYear());
        budget.setMonth(req.getMonth());
        budget.setBudgetAmount(req.getBudgetAmount());

        budgetRepository.save(budget);
        return ResponseEntity.ok(budget);
    }

    @GetMapping("/summary")
    public ResponseEntity<?> summary(@RequestHeader("Authorization") String authHeader) throws Exception {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        List<Map<String, Object>> result = new ArrayList<>();

        for (BudgetEntity b : budgetRepository.findByUser(user)) {
            double remaining = Math.max(0, b.getBudgetAmount() - b.getSpentAmount());
            double progress = b.getBudgetAmount() == 0 ? 0 :
                    Math.min(100, (b.getSpentAmount() / b.getBudgetAmount()) * 100);

            Map<String, Object> m = new HashMap<>();
            m.put("id", b.getId());
            m.put("category", b.getCategory());
            m.put("budgetAmount", b.getBudgetAmount());
            m.put("spentAmount", b.getSpentAmount());
            m.put("remainingAmount", remaining);
            m.put("progress", progress);
            result.add(m);
        }
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBudget(@PathVariable Long id,
                                          @RequestHeader("Authorization") String authHeader) throws Exception {

        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        BudgetEntity budget = budgetRepository.findById(id)
                .orElseThrow(() -> new Exception("Budget not found"));

        if (!budget.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).build();
        }

        budgetRepository.delete(budget);
        return ResponseEntity.ok("Deleted");
    }
}

