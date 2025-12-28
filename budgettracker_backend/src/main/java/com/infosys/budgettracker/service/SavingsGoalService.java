
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.repository.SavingsGoalRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SavingsGoalService {

    @Autowired private SavingsGoalRepository savingsGoalRepository;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void updateGoalAmount(Long goalId, double amountChange) {

        savingsGoalRepository.updateSavedAmount(goalId, amountChange);

        // 🔥 CLEAR CACHE so UI sees update instantly
        entityManager.clear();
    }
}
