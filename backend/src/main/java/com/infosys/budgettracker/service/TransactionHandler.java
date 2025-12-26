
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.BudgetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class TransactionHandler {

    @Autowired private BudgetRepository budgetRepository;
    @Autowired private SavingsGoalService savingsGoalService;

    public void updateBudgetAndGoal(
            TransactionEntity tx,
            UserEntity user,
            double amountChange
    ) {

        // 🟥 EXPENSE → BUDGET
        if ("EXPENSE".equalsIgnoreCase(tx.getType())) {
            budgetRepository.findByUser(user).stream()
                    .filter(b ->
                            b.getYear() == tx.getDate().getYear()
                                    && b.getMonth() == tx.getDate().getMonthValue()
                                    && b.getCategory().equalsIgnoreCase(tx.getCategory())
                    )
                    .findFirst()
                    .ifPresent(b -> {
                        double newSpent = b.getSpentAmount() + amountChange;
                        b.setSpentAmount(Math.max(0, newSpent));
                        budgetRepository.save(b);
                    });
        }

        // 🟩 INCOME → SAVINGS GOAL
        if ("INCOME".equalsIgnoreCase(tx.getType())
                && tx.getSavingsGoal() != null
                && tx.getSavingsAllocationAmount() != null) {

            double delta = amountChange > 0
                    ? tx.getSavingsAllocationAmount()
                    : -tx.getSavingsAllocationAmount();

            savingsGoalService.updateGoalAmount(
                    tx.getSavingsGoal().getId(),
                    delta
            );
        }
    }
}

