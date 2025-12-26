
package com.infosys.budgettracker.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Table(name = "transactions")
@Getter
@Setter
public class TransactionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String type; // INCOME or EXPENSE

    @Column(nullable = false)
    private String category;

    @Column(nullable = false)
    private double amount;

    private String description;

    @Column(nullable = false)
    private String account; // Cash, Bank

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Column(nullable = false)
    private LocalDate date;

    // NEW FIELD: Specific amount from the income to allocate to a goal (can be null/0)
    private Double savingsAllocationAmount; 
    
    // Optional: Link to Savings Goal
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "savings_goal_id")
    private SavingsGoalEntity savingsGoal; 

    // Link to User
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}

