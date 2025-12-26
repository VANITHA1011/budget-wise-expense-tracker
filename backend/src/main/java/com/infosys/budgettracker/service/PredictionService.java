
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth; // This is all we need!
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

// Cleaned up imports. No need for Calendar, ZoneId, Instant, etc.

@Service
public class PredictionService {

    @Autowired
    private TransactionRepository transactionRepository;

    public Map<String, Object> predictNextMonthExpenses(UserEntity user) {
        
        List<TransactionEntity> expenses = transactionRepository.findByUser(user).stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .sorted(Comparator.comparing(TransactionEntity::getDate))
                .toList();

        if (expenses.size() < 3) {
            return Map.of("total_predicted_expense", 0.0, 
                          "message", "Insufficient data for accurate prediction. Need at least 3 months of expense data.");
        }

        // 2. Aggregate expenses by month and category
        Map<YearMonth, Map<String, Double>> monthlyCategoryTotals = expenses.stream()
            .collect(Collectors.groupingBy(
                t -> {
                    // ⭐ THE CORRECT FIX: Simply convert LocalDate (t.getDate()) to YearMonth.
                    return YearMonth.from(t.getDate());
                },
                Collectors.groupingBy(
                    TransactionEntity::getCategory,
                    Collectors.summingDouble(TransactionEntity::getAmount)
                )
            ));

        // 3. Simple AI: Calculate the average expense over the last 3 months
        List<YearMonth> recentMonths = monthlyCategoryTotals.keySet().stream()
                .sorted(Comparator.reverseOrder())
                .limit(3)
                .toList();
        
        if (recentMonths.isEmpty()) {
             return Map.of("total_predicted_expense", 0.0, 
                           "message", "No recent expense data found in the past 3 months.");
        }

        double totalExpenseSum = monthlyCategoryTotals.entrySet().stream()
            .filter(entry -> recentMonths.contains(entry.getKey()))
            .mapToDouble(entry -> entry.getValue().values().stream().mapToDouble(Double::doubleValue).sum())
            .sum();

        double averageMonthlyExpense = totalExpenseSum / recentMonths.size();
        
        return Map.of(
            "total_predicted_expense", Math.round(averageMonthlyExpense * 100.0) / 100.0,
            "message", String.format("Prediction based on average expenses over the last %d months.", recentMonths.size())
        );
    }
} 
