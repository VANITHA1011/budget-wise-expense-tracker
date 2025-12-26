package com.infosys.budgettracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "savings_goals")
@Getter
@Setter
public class SavingsGoalEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String goalName; // Vacation, Emergency, etc.

    private double targetAmount; // Total goal

    private double savedAmount; // Updated as transactions are added

    private LocalDate targetDate;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;
}
