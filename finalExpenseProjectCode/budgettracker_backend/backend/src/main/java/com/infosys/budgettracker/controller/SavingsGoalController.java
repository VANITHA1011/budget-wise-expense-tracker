


package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.model.SavingsGoalEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.SavingsGoalRepository;
import com.infosys.budgettracker.repository.UserRepository;
import com.infosys.budgettracker.service.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/savings-goals")
public class SavingsGoalController {

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    // ✅ CREATE (POST /api/savings-goals)
    @PostMapping
    public ResponseEntity<?> addSavingsGoal(@RequestBody SavingsGoalEntity goal,
                                            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);

            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found"));
            
            // 🛑 FIX: Ensure savedAmount is initialized to 0.0 for a new goal
            if (goal.getSavedAmount() < 0 || goal.getSavedAmount() == 0.0) {
                 goal.setSavedAmount(0.0);
            }
            
            goal.setUser(user);
            SavingsGoalEntity saved = savingsGoalRepository.save(goal);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved); 
            
        } catch (Exception e) {
            System.err.println("Goal Creation Error: " + e.getMessage());
            return ResponseEntity.badRequest().body("Failed to create goal: " + e.getMessage());
        }
    }

    // 🔄 READ All (GET /api/savings-goals)
    @GetMapping
    public ResponseEntity<?> getAllGoals(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);

            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found"));

            List<SavingsGoalEntity> goals = savingsGoalRepository.findByUser(user);
            return ResponseEntity.ok(goals);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
    
    // ✍️ UPDATE (PUT /api/savings-goals/{id})
    @PutMapping("/{id}")
    public ResponseEntity<?> updateGoal(@PathVariable Long id, @RequestBody SavingsGoalEntity goalDetails,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);

            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found"));

            SavingsGoalEntity existingGoal = savingsGoalRepository.findById(id)
                    .orElseThrow(() -> new Exception("Savings goal not found for this id: " + id));

            if (!existingGoal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Goal does not belong to user.");
            }

            existingGoal.setGoalName(goalDetails.getGoalName());
            existingGoal.setTargetAmount(goalDetails.getTargetAmount());
            existingGoal.setSavedAmount(goalDetails.getSavedAmount()); 
            existingGoal.setTargetDate(goalDetails.getTargetDate());

            final SavingsGoalEntity updatedGoal = savingsGoalRepository.save(existingGoal);
            return ResponseEntity.ok(updatedGoal);

        } catch (Exception e) {
            System.err.println("Goal Update Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Update failed: " + e.getMessage());
        }
    }

    // 🗑️ DELETE (DELETE /api/savings-goals/{id})
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteGoal(@PathVariable Long id,
                                        @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String username = jwtUtil.extractUsername(token);

            UserEntity user = userRepository.findByUsername(username)
                    .orElseThrow(() -> new Exception("User not found"));

            SavingsGoalEntity goal = savingsGoalRepository.findById(id)
                    .orElseThrow(() -> new Exception("Savings goal not found for this id: " + id));

            if (!goal.getUser().getId().equals(user.getId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access denied. Goal does not belong to user.");
            }

            savingsGoalRepository.delete(goal);
            return ResponseEntity.ok("Goal deleted successfully.");

        } catch (Exception e) {
            System.err.println("Goal Delete Error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Delete failed: " + e.getMessage());
        }
    }
}