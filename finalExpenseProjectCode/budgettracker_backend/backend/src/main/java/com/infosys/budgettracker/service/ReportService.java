
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    @Autowired
    private TransactionRepository transactionRepository;

    /**
     * Aggregates expenses by category and month for chart visualization. (Used by Pie Chart)
     * @param user The logged-in user.
     * @return Map of {category: total_amount} for the period.
     */
    public Map<String, Double> getCategorySummary(UserEntity user, int months) {
        // ... (Existing, correct code for Pie Chart summary) ...
        List<TransactionEntity> expenses = transactionRepository.findByUser(user).stream()
                .filter(t -> "EXPENSE".equalsIgnoreCase(t.getType()))
                .filter(t -> t.getDate() != null) // Robustness check
                .sorted(Comparator.comparing(TransactionEntity::getDate).reversed())
                .limit(months * 30) 
                .toList();
        
        return expenses.stream()
                .collect(Collectors.groupingBy(
                        TransactionEntity::getCategory,
                        Collectors.summingDouble(TransactionEntity::getAmount)
                )).entrySet().stream()
                .sorted(Map.Entry.comparingByValue(Comparator.reverseOrder()))
                .collect(Collectors.toMap(
                        Map.Entry::getKey, 
                        Map.Entry::getValue, 
                        (e1, e2) -> e1, 
                        LinkedHashMap::new
                ));
    }
    
    /**
     * Aggregates monthly totals for Income and Expense. (Used by Bar Chart)
     * @param user The logged-in user.
     * @param months The number of historical months to include.
     * @return Map of {YYYY-MM: {INCOME: amount, EXPENSE: amount}}.
     */
    public Map<String, Map<String, Double>> getMonthlyTrend(UserEntity user, int months) {
        // ... (Existing, correct code for Bar Chart trend) ...
        List<TransactionEntity> transactions = transactionRepository.findByUser(user);

        Map<YearMonth, Map<String, Double>> monthlyTotals = transactions.stream()
                .filter(t -> t.getDate() != null) // Robustness check
                .collect(Collectors.groupingBy(
                        t -> YearMonth.from(t.getDate()),
                        Collectors.groupingBy(
                                TransactionEntity::getType,
                                Collectors.summingDouble(TransactionEntity::getAmount)
                        )
                ));

        return monthlyTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.reverseOrder()))
                .limit(months)
                .sorted(Map.Entry.comparingByKey())
                .collect(Collectors.toMap(
                        entry -> entry.getKey().toString(), 
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new
                ));
    }
    
    /**
     * 🔥 **NEW METHOD FOR FINANCIAL ADVISOR** 🔥
     * Aggregates monthly expense totals by category for a trend analysis.
     * @param user The logged-in user.
     * @param months The number of historical months to include (e.g., 2 for MoM comparison).
     * @return Map of {YYYY-MM: {Category: total_amount}}.
     */
    public Map<String, Map<String, Double>> getMonthlyExpenseByCategoryTrend(UserEntity user, int months) {

        List<TransactionEntity> transactions = transactionRepository.findByUser(user);

        // Filter for EXPENSE transactions only and group by YearMonth and then by Category
        Map<YearMonth, Map<String, Double>> monthlyCategoryTotals = transactions.stream()
            .filter(t -> t.getDate() != null && "EXPENSE".equalsIgnoreCase(t.getType()))
            .collect(Collectors.groupingBy(
                t -> YearMonth.from(t.getDate()),
                Collectors.groupingBy(
                    TransactionEntity::getCategory,
                    Collectors.summingDouble(TransactionEntity::getAmount)
                )
            ));

        // Format the map, limiting to the last 'months' for efficiency
        return monthlyCategoryTotals.entrySet().stream()
                .sorted(Map.Entry.comparingByKey(Comparator.reverseOrder()))
                .limit(months)
                .sorted(Map.Entry.comparingByKey()) // Sort back to chronological order
                .collect(Collectors.toMap(
                        entry -> entry.getKey().toString(), 
                        Map.Entry::getValue,
                        (e1, e2) -> e1,
                        LinkedHashMap::new 
                ));
    }
}
