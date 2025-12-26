
package com.infosys.budgettracker.repository;

import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<TransactionEntity, Long> {
    List<TransactionEntity> findByUser(UserEntity user);
    List<TransactionEntity> findByUserId(Long userId); // add this - used by admin
}
