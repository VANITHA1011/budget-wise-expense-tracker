
package com.infosys.budgettracker.repository;

import com.infosys.budgettracker.model.SavingsGoalEntity;
import com.infosys.budgettracker.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying; 
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional; 

import java.util.List;

@Repository
public interface SavingsGoalRepository extends JpaRepository<SavingsGoalEntity, Long> {
    
    List<SavingsGoalEntity> findByUser(UserEntity user);

    /**
     * CRITICAL: return 'int' so callers can check how many rows changed.
     */
    @Modifying 
    @Transactional 
    @Query("UPDATE SavingsGoalEntity s SET s.savedAmount = s.savedAmount + :amount WHERE s.id = :goalId")
    int updateSavedAmount(@Param("goalId") Long goalId, @Param("amount") double amount); 
}
