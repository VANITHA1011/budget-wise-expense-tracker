package com.infosys.budgettracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "audit_log")
@Getter
@Setter
public class AuditLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long adminId;
    private String action;
    private String targetType;
    private Long targetId;

    @Column(columnDefinition = "TEXT")
    private String details;

    private LocalDateTime createdAt = LocalDateTime.now();
}
