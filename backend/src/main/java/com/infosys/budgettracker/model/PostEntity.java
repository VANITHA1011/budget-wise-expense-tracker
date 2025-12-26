// src/main/java/com/infosys/budgettracker/model/PostEntity.java

package com.infosys.budgettracker.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "forum_post")
@Getter
@Setter
public class PostEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private UserEntity user;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    private int likes = 0;
    
    @Column(nullable = false)
    private LocalDateTime postedDate = LocalDateTime.now();

    // Required by JPA
    public PostEntity() {
    }
}