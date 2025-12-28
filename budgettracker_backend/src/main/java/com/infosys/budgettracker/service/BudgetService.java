
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.dto.BudgetDTO;
import com.infosys.budgettracker.model.BudgetEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.BudgetRepository;
import com.infosys.budgettracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BudgetService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public BudgetDTO addBudget(BudgetEntity budget, String authHeader) throws Exception {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        budget.setUser(user);
        BudgetEntity saved = budgetRepository.save(budget);

        return new BudgetDTO(saved.getId(), saved.getCategory(), saved.getBudgetAmount(), saved.getSpentAmount());
    }

    public List<BudgetDTO> getBudgets(String authHeader) throws Exception {
        String username = jwtUtil.extractUsername(authHeader.replace("Bearer ", ""));
        UserEntity user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));

        return budgetRepository.findByUser(user).stream()
                .map(b -> new BudgetDTO(b.getId(), b.getCategory(), b.getBudgetAmount(), b.getSpentAmount()))
                .collect(Collectors.toList());
    }
}
