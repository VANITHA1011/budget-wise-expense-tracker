package com.infosys.budgettracker.service;

import com.infosys.budgettracker.model.AuditLog;
import com.infosys.budgettracker.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    public void record(Long adminId, String action, String targetType, Long targetId, String details) {
        AuditLog log = new AuditLog();
        log.setAdminId(adminId);
        log.setAction(action);
        log.setTargetType(targetType);
        log.setTargetId(targetId);
        log.setDetails(details);
        auditLogRepository.save(log);
    }
}
