
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.dto.InsightDTO;
import com.infosys.budgettracker.model.BudgetEntity;
import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.model.SavingsGoalEntity;
import com.infosys.budgettracker.repository.BudgetRepository;
import com.infosys.budgettracker.repository.TransactionRepository;
import com.infosys.budgettracker.repository.SavingsGoalRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.temporal.ChronoUnit;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class FinancialAdvisorService {

    @Autowired
    private BudgetRepository budgetRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private SavingsGoalRepository savingsGoalRepository;

    // --- Helper Class & Methods ---
    private static class CurrentMonthSummary {
        double totalIncome = 0.0;
        double totalExpense = 0.0;
        double netBalance = 0.0;
    }

    /**
     * Summarize current month income/expense
     */
    private CurrentMonthSummary getCurrentMonthSummary(UserEntity user) {
        CurrentMonthSummary summary = new CurrentMonthSummary();
        YearMonth currentMonth = YearMonth.now();
        transactionRepository.findByUser(user).stream()
            .filter(t -> t.getDate() != null && YearMonth.from(t.getDate()).equals(currentMonth))
            .forEach(t -> {
                if ("INCOME".equalsIgnoreCase(t.getType())) {
                    summary.totalIncome += t.getAmount();
                } else if ("EXPENSE".equalsIgnoreCase(t.getType())) {
                    summary.totalExpense += t.getAmount();
                }
            });
        summary.netBalance = summary.totalIncome - summary.totalExpense;
        return summary;
    }

    /**
     * Returns aggregated expense sum per category for the given user for the supplied YearMonth.
     * If month == null, returns aggregated over ALL transactions (useful fallback).
     */
    private Map<String, Double> getExpenseByCategoryForMonth(UserEntity user, YearMonth month) {
        return transactionRepository.findByUser(user).stream()
            .filter(t -> t.getDate() != null && "EXPENSE".equalsIgnoreCase(t.getType()))
            .filter(t -> month == null || YearMonth.from(t.getDate()).equals(month))
            .collect(Collectors.groupingBy(
                TransactionEntity::getCategory,
                Collectors.summingDouble(TransactionEntity::getAmount)
            ));
    }

    /**
     * Convenience: current-month expenses by category
     */
    private Map<String, Double> getCurrentMonthExpenseByCategory(UserEntity user) {
        return getExpenseByCategoryForMonth(user, YearMonth.now());
    }

    /**
     * Predict next month's expense per category using simple average of last N months (including current).
     * If insufficient history, falls back to current-month amount or zero.
     */
    private Map<String, Double> predictNextMonthExpensesByCategory(UserEntity user, int monthsToAverage) {
        if (monthsToAverage <= 0) monthsToAverage = 3;

        // Collect sums per category for each of the last N months
        Map<String, List<Double>> perCategoryValues = new HashMap<>();

        YearMonth now = YearMonth.now();
        List<YearMonth> months = new ArrayList<>();
        for (int i = 0; i < monthsToAverage; i++) {
            months.add(now.minusMonths(i));
        }

        // For each month collect category sums
        for (YearMonth m : months) {
            Map<String, Double> mapForMonth = getExpenseByCategoryForMonth(user, m);
            // add values (if missing for a category in a month, treat as 0)
            for (Map.Entry<String, Double> e : mapForMonth.entrySet()) {
                perCategoryValues.computeIfAbsent(e.getKey(), k -> {
                    List<Double> list = new ArrayList<>();
                    // initialize previous months with zeros to maintain length when first seen late
                    return list;
                }).add(e.getValue());
            }
            // Also ensure categories not present this month but present earlier are accounted for (0 for this month)
            Set<String> existing = perCategoryValues.keySet();
            for (String cat : existing) {
                Map<String, Double> mm = mapForMonth;
                if (!mm.containsKey(cat)) {
                    perCategoryValues.computeIfAbsent(cat, k -> new ArrayList<>()).add(0.0);
                }
            }
            // We may have new categories not yet in perCategoryValues handled above already
        }

        // It's possible some categories have fewer than monthsToAverage data points - normalize
        Map<String, Double> predicted = new HashMap<>();
        for (Map.Entry<String, List<Double>> e : perCategoryValues.entrySet()) {
            List<Double> vals = e.getValue();
            // If values size is less than monthsToAverage, pad with zeros
            while (vals.size() < monthsToAverage) vals.add(0, 0.0); // prepend zeros so average uses trailing months as well
            double sum = 0.0;
            for (double v : vals) sum += v;
            double avg = sum / monthsToAverage;
            predicted.put(e.getKey(), avg);
        }

        // As a safety: if predicted map is empty, fallback to current month aggregation
        if (predicted.isEmpty()) {
            Map<String, Double> current = getCurrentMonthExpenseByCategory(user);
            for (Map.Entry<String, Double> e : current.entrySet()) {
                predicted.put(e.getKey(), e.getValue());
            }
        }

        return predicted;
    }

    public InsightDTO generateFinancialInsights(UserEntity user) {
        List<String> alerts = generateSavingAlerts(user);
        List<String> tips = generateSavingTips(user);

        return new InsightDTO(tips, alerts);
    }

    // --- 1. SAVING ALERTS (Budget Overspending) ---
    public List<String> generateSavingAlerts(UserEntity user) {
        List<String> alerts = new ArrayList<>();

        List<BudgetEntity> budgets = budgetRepository.findByUser(user);
        if (budgets == null || budgets.isEmpty()) return alerts;

        // current spent this month
        Map<String, Double> currentMonthSpend = getCurrentMonthExpenseByCategory(user);

        // predicted next-month spend (simple avg of last 3 months)
        Map<String, Double> predictedNextMonthSpend = predictNextMonthExpensesByCategory(user, 3);

        // total budgets map for convenience
        Map<String, BudgetEntity> budgetByCategory = budgets.stream()
            .filter(b -> b.getCategory() != null)
            .collect(Collectors.toMap(b -> b.getCategory(), b -> b, (a, b) -> a));

        // 1) Immediate current-month overspend or near-limit warnings (existing behaviour)
        for (BudgetEntity budget : budgets) {
            double budgetAmount = budget.getBudgetAmount();
            String category = budget.getCategory();
            double spentAmount = currentMonthSpend.getOrDefault(category, 0.0);

            if (budgetAmount <= 0) continue;

            double percentageUsed = (spentAmount / budgetAmount) * 100.0;
            double remaining = budgetAmount - spentAmount;

            // format remaining as positive non-negative
            double remainingRounded = Math.max(0.0, Math.round(remaining * 100.0) / 100.0);

            if (percentageUsed >= 100.0) {
                double overshoot = Math.max(0.0, spentAmount - budgetAmount);
                alerts.add("🔴 **Budget Exceeded:** Your **" + category + "** budget is overspent by **₹" + String.format("%.2f", overshoot) + "**. Immediate action is needed.");
            } else if (percentageUsed >= 85.0) {
                alerts.add("🔥 **Budget Warning:** You've used **" + String.format("%.0f", percentageUsed) + "%** of your **" + category + "** budget. Only ₹" + String.format("%.2f", remainingRounded) + " remains.");
            }
        }

        // 2) Predicted overspend alerts (strong signal - show even if current month not exceeded)
        for (BudgetEntity budget : budgets) {
            String category = budget.getCategory();
            double budgetAmount = budget.getBudgetAmount();
            if (budgetAmount <= 0) continue;

            double predicted = predictedNextMonthSpend.getOrDefault(category, 0.0);
            // rounding small floating jitter
            predicted = Math.round(predicted * 100.0) / 100.0;

            // if predicted will exceed budget, produce a predicted overspend alert
            if (predicted > budgetAmount) {
                double predictedOvershoot = predicted - budgetAmount;
                // avoid tiny near-zero messages
                if (predictedOvershoot < 0.01) predictedOvershoot = 0.0;
                if (predictedOvershoot > 0.0) {
                    alerts.add("⚠️ **Predicted Overspend:** Based on recent trend, your **" + category + "** spending is predicted to be **₹" + String.format("%.2f", predicted) + "** next month and will exceed the budget of **₹" + String.format("%.2f", budgetAmount) + "** by **₹" + String.format("%.2f", predictedOvershoot) + "**. Consider reducing spending or increasing the budget.");
                }
            }
        }

        // Ensure alerts are unique and keep order (predicted alerts likely more urgent — keep all)
        List<String> unique = alerts.stream().distinct().collect(Collectors.toList());
        return unique;
    }

    // --- 2. SAVING TIPS (Trends and Savings Rate) ---
    public List<String> generateSavingTips(UserEntity user) {
        List<String> tips = new ArrayList<>();
        CurrentMonthSummary summary = getCurrentMonthSummary(user);
        LocalDate today = LocalDate.now();

        // LOGIC 1: LOW SAVINGS RATE CHECK (If saving < 10%)
        if (summary.totalIncome > 0) {
            double currentSavingsRate = (summary.netBalance / summary.totalIncome) * 100.0;
            if (currentSavingsRate < 10.0) {
                tips.add("⚠️ **Low Savings Rate:** Your current rate is **" + String.format("%.1f", currentSavingsRate) + "%**. Aim for 10-20% by setting a goal. 📈");
            }
        }

        // LOGIC 2: PROFESSIONAL TARGETED SAVING TIP (Based on Highest Current Expense)
        Map<String, Double> currentMonthExpenses = getCurrentMonthExpenseByCategory(user);
        Optional<Map.Entry<String, Double>> biggestExpenseCategory = currentMonthExpenses.entrySet().stream()
            .max(Comparator.comparingDouble(Map.Entry::getValue));

        if (biggestExpenseCategory.isPresent()) {
            String category = biggestExpenseCategory.get().getKey();
            double currentSpend = biggestExpenseCategory.get().getValue();
            double suggestedReduction = currentSpend * 0.10;
            if (suggestedReduction >= 100.0) {
                tips.add("💡 **Smart Cut:** Your highest expense is **" + category + "** (₹" + String.format("%.2f", currentSpend) + "). A 10% reduction could save you **₹" + String.format("%.2f", suggestedReduction) + "** this month. 💰");
            }
        }

        // LOGIC 3: SAVINGS GOAL ALERT
        List<SavingsGoalEntity> activeGoals = savingsGoalRepository.findByUser(user);
        List<SavingsGoalEntity> relevantGoals = activeGoals.stream()
            .filter(goal -> goal.getTargetAmount() > goal.getSavedAmount())
            .filter(goal -> goal.getTargetDate() != null)
            .filter(goal -> goal.getTargetDate().isAfter(today))
            .collect(Collectors.toList());

        for (SavingsGoalEntity goal : relevantGoals) {
            double remainingAmount = goal.getTargetAmount() - goal.getSavedAmount();
            long remainingDays = ChronoUnit.DAYS.between(today, goal.getTargetDate());
            long remainingMonths = ChronoUnit.MONTHS.between(today.withDayOfMonth(1), goal.getTargetDate().withDayOfMonth(1));

            if (remainingDays > 0 && remainingMonths == 0) {
                remainingMonths = 1;
            }
            if (remainingMonths <= 0) continue;

            double monthlySaveRequired = remainingAmount / remainingMonths;

            if (remainingDays <= 60) {
                tips.add("🚨 **URGENT Goal:** Your **" + goal.getGoalName() + "** goal is due in **" + remainingDays + " days!** You must save **₹" + String.format("%.2f", remainingAmount) + "** before " + goal.getTargetDate() + " to meet the target. 🏃‍♀️");
                continue;
            }

            // Heuristic: check falling behind
            double totalDays = ChronoUnit.DAYS.between(goal.getTargetDate().minusYears(1).withDayOfMonth(1), goal.getTargetDate());
            double elapsedDays = ChronoUnit.DAYS.between(goal.getTargetDate().minusYears(1).withDayOfMonth(1), today);
            double expectedProgressRatio = totalDays > 0 ? (elapsedDays / totalDays) : 0.0;
            double currentProgressRatio = goal.getTargetAmount() > 0 ? (goal.getSavedAmount() / goal.getTargetAmount()) : 0.0;

            if (expectedProgressRatio > currentProgressRatio + 0.20) {
                tips.add("⏳ **Goal Check:** To hit your **" + goal.getGoalName() + "** target, your required monthly save is **₹" + String.format("%.2f", monthlySaveRequired) + "** for the next **" + remainingMonths + " months**. Review your plan. 📝");
            }
        }

        // LOGIC 4: DEFAULT/Positive Tip
        if (tips.isEmpty()) {
            tips.add("✅ **Great Job!** Your finances are stable and on track. Keep up the good work! 👍");
        }

        return tips;
    }
}
