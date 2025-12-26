
package com.infosys.budgettracker.dto;

import com.infosys.budgettracker.model.TransactionEntity;
import java.time.LocalDate;

public class TransactionDTO {

    private Long id;
    private String type;
    private String category;
    private double amount;
    private String description;
    private String account;
    private LocalDate date;
    private String username;

    private Long savingsGoalId;
    private Double savingsAllocationAmount;

    public TransactionDTO(
            Long id,
            String type,
            String category,
            double amount,
            String description,
            String account,
            LocalDate date,
            String username,
            Long savingsGoalId,
            Double savingsAllocationAmount
    ) {
        this.id = id;
        this.type = type;
        this.category = category;
        this.amount = amount;
        this.description = description;
        this.account = account;
        this.date = date;
        this.username = username;
        this.savingsGoalId = savingsGoalId;
        this.savingsAllocationAmount = savingsAllocationAmount;
    }

    // ✅ STATIC MAPPER (THIS FIXES YOUR ERROR)
    public static TransactionDTO from(TransactionEntity t) {
        return new TransactionDTO(
                t.getId(),
                t.getType(),
                t.getCategory(),
                t.getAmount(),
                t.getDescription(),
                t.getAccount(),
                t.getDate(),
                t.getUser() != null ? t.getUser().getUsername() : null,
                t.getSavingsGoal() != null ? t.getSavingsGoal().getId() : null,
                t.getSavingsAllocationAmount()
        );
    }

    // Getters & Setters
    public Long getId() { return id; }
    public String getType() { return type; }
    public String getCategory() { return category; }
    public double getAmount() { return amount; }
    public String getDescription() { return description; }
    public String getAccount() { return account; }
    public LocalDate getDate() { return date; }
    public String getUsername() { return username; }
    public Long getSavingsGoalId() { return savingsGoalId; }
    public Double getSavingsAllocationAmount() { return savingsAllocationAmount; }
}
