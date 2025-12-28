package com.infosys.budgettracker.dto;

import java.time.LocalDate;

public class SavingsGoalDTO {
    private Long id;
    private String goalName;
    private double targetAmount;
    private double savedAmount;
    private LocalDate targetDate;

    public SavingsGoalDTO(Long id, String goalName, double targetAmount, double savedAmount, LocalDate targetDate) {
        this.id = id;
        this.goalName = goalName;
        this.targetAmount = targetAmount;
        this.savedAmount = savedAmount;
        this.targetDate = targetDate;
    }

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getGoalName() { return goalName; }
    public void setGoalName(String goalName) { this.goalName = goalName; }
    public double getTargetAmount() { return targetAmount; }
    public void setTargetAmount(double targetAmount) { this.targetAmount = targetAmount; }
    public double getSavedAmount() { return savedAmount; }
    public void setSavedAmount(double savedAmount) { this.savedAmount = savedAmount; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
}
