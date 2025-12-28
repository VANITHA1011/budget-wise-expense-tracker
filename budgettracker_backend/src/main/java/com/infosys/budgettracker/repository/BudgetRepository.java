
package com.infosys.budgettracker.repository;

import com.infosys.budgettracker.model.BudgetEntity;
import com.infosys.budgettracker.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<BudgetEntity, Long> {

    List<BudgetEntity> findByUser(UserEntity user);

    Optional<BudgetEntity> findByUserAndCategoryAndYearAndMonth(
            UserEntity user,
            String category,
            int year,
            int month
    );
}

