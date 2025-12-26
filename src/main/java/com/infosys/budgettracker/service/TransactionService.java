
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.dto.TransactionDTO;
import com.infosys.budgettracker.model.*;
import com.infosys.budgettracker.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransactionService {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private SavingsGoalRepository savingsGoalRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private JwtUtil jwtUtil;
    @Autowired private TransactionHandler transactionHandler;

    // 🔐 Helper
    private UserEntity getUser(String authHeader) throws Exception {
        String token = authHeader.replace("Bearer ", "");
        String username = jwtUtil.extractUsername(token);
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found"));
    }

    // ✅ ADD TRANSACTION
    @Transactional
    public TransactionDTO addTransaction(TransactionEntity tx, String authHeader) throws Exception {

        UserEntity user = getUser(authHeader);
        tx.setUser(user);

        if (tx.getSavingsGoal() != null && tx.getSavingsGoal().getId() != null) {
            SavingsGoalEntity goal = savingsGoalRepository
                    .findById(tx.getSavingsGoal().getId())
                    .orElseThrow(() -> new Exception("Savings goal not found"));
            tx.setSavingsGoal(goal);

            if ("INCOME".equalsIgnoreCase(tx.getType())) {
                if (tx.getSavingsAllocationAmount() == null || tx.getSavingsAllocationAmount() <= 0) {
                    tx.setSavingsAllocationAmount(tx.getAmount());
                }
            }
        } else {
            tx.setSavingsGoal(null);
            tx.setSavingsAllocationAmount(null);
        }

        TransactionEntity saved = transactionRepository.save(tx);

        // 🔥 update budget + goal
        transactionHandler.updateBudgetAndGoal(saved, user, saved.getAmount());

        return TransactionDTO.from(saved);
    }

    // ✅ GET ALL TRANSACTIONS  🔥🔥 THIS WAS MISSING
    public List<TransactionDTO> getAllTransactions(String authHeader) throws Exception {

        UserEntity user = getUser(authHeader);

        return transactionRepository.findByUser(user)
                .stream()
                .map(TransactionDTO::from)
                .collect(Collectors.toList());
    }

    // ✅ UPDATE TRANSACTION
    @Transactional
    public TransactionDTO updateTransaction(Long id, TransactionEntity updated, String authHeader) throws Exception {

        UserEntity user = getUser(authHeader);
        TransactionEntity old = transactionRepository.findById(id)
                .orElseThrow(() -> new Exception("Transaction not found"));

        // 🔁 reverse old impact
        transactionHandler.updateBudgetAndGoal(old, user, -old.getAmount());

        old.setType(updated.getType());
        old.setCategory(updated.getCategory());
        old.setAmount(updated.getAmount());
        old.setDescription(updated.getDescription());
        old.setAccount(updated.getAccount());
        old.setDate(updated.getDate());

        if (updated.getSavingsGoal() != null && updated.getSavingsGoal().getId() != null) {
            SavingsGoalEntity goal = savingsGoalRepository
                    .findById(updated.getSavingsGoal().getId())
                    .orElseThrow(() -> new Exception("Savings goal not found"));
            old.setSavingsGoal(goal);

            old.setSavingsAllocationAmount(
                    updated.getSavingsAllocationAmount() != null
                            ? updated.getSavingsAllocationAmount()
                            : updated.getAmount()
            );
        } else {
            old.setSavingsGoal(null);
            old.setSavingsAllocationAmount(null);
        }

        TransactionEntity saved = transactionRepository.save(old);

        // 🔥 apply new impact
        transactionHandler.updateBudgetAndGoal(saved, user, saved.getAmount());

        return TransactionDTO.from(saved);
    }

    // ✅ DELETE TRANSACTION
    @Transactional
    public void deleteTransaction(Long id, String authHeader) throws Exception {

        UserEntity user = getUser(authHeader);
        TransactionEntity tx = transactionRepository.findById(id)
                .orElseThrow(() -> new Exception("Transaction not found"));

        transactionHandler.updateBudgetAndGoal(tx, user, -tx.getAmount());
        transactionRepository.delete(tx);
    }
}
