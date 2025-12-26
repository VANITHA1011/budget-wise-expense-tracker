
package com.infosys.budgettracker.dto;

public class BudgetDTO {

    private Long id;
    private String category;
    private double budgetAmount;
    private double spentAmount;

    // 🔑 NEW FIELDS (MONTHLY BUDGET SUPPORT)
    private int year;
    private int month;

    // ✅ NEW CONSTRUCTOR (USED BY SERVICE)
    public BudgetDTO(Long id,
                     String category,
                     double budgetAmount,
                     double spentAmount,
                     int year,
                     int month) {

        this.id = id;
        this.category = category;
        this.budgetAmount = budgetAmount;
        this.spentAmount = spentAmount;
        this.year = year;
        this.month = month;
    }

    // 🔁 OPTIONAL: Keep old constructor (if used elsewhere)
    public BudgetDTO(Long id,
                     String category,
                     double budgetAmount,
                     double spentAmount) {

        this.id = id;
        this.category = category;
        this.budgetAmount = budgetAmount;
        this.spentAmount = spentAmount;
    }

    // -------- Getters & Setters --------

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public double getBudgetAmount() { return budgetAmount; }
    public void setBudgetAmount(double budgetAmount) { this.budgetAmount = budgetAmount; }

    public double getSpentAmount() { return spentAmount; }
    public void setSpentAmount(double spentAmount) { this.spentAmount = spentAmount; }

    public int getYear() { return year; }
    public void setYear(int year) { this.year = year; }

    public int getMonth() { return month; }
    public void setMonth(int month) { this.month = month; }
}
