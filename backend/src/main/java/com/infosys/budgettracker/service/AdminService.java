
package com.infosys.budgettracker.service;

import com.infosys.budgettracker.dto.UserAdminDTO;
import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.BudgetRepository;
import com.infosys.budgettracker.repository.TransactionRepository;
import com.infosys.budgettracker.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final AuditLogService auditLogService;

    public AdminService(UserRepository userRepository,
                        TransactionRepository transactionRepository,
                        BudgetRepository budgetRepository,
                        AuditLogService auditLogService) {
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.auditLogService = auditLogService;
    }

    /**
     * Get all users with optional search & role filter.
     * - search: substring search on username or email (case-insensitive)
     * - role: ADMIN | USER | BANNED | ALL (case-insensitive)
     *
     * Uses repository methods that include inactive rows so BANNED filter works.
     */
    public List<UserAdminDTO> getAllUsers(Optional<String> searchOpt, Optional<String> roleOpt) {
        String search = searchOpt.map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .orElse(null);
        String role = roleOpt.map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toUpperCase)
                .orElse(null);

        List<UserEntity> users;

        if ("BANNED".equals(role)) {
            users = userRepository.findBannedUsers();
        } else if ("ALL".equals(role)) {
            users = userRepository.findAllIncludingInactive();
        } else {
            users = userRepository.findAll();
        }

        final boolean filteringForBanned = "BANNED".equals(role);

        return users.stream()
                .filter(u -> {
                    if (search != null) {
                        String username = Optional.ofNullable(u.getUsername()).orElse("").toLowerCase();
                        String email = Optional.ofNullable(u.getEmail()).orElse("").toLowerCase();
                        if (!username.contains(search) && !email.contains(search)) return false;
                    }
                    if (role != null && !role.equals("ALL")) {
                        if (role.equals("BANNED")) {
                            return !u.isActive();
                        } else {
                            return role.equalsIgnoreCase(u.getRole());
                        }
                    }
                    return true;
                })
                .map(u -> {
                    boolean bannedFlag = !u.isActive();
                    String returnedRole = u.getRole();
                    // Compatibility: when frontend requested BANNED explicitly, present role as "BANNED"
                    if (filteringForBanned) {
                        returnedRole = "BANNED";
                    }
                    return new UserAdminDTO(u.getId(), u.getUsername(), u.getEmail(), returnedRole, u.isActive(), bannedFlag);
                })
                .collect(Collectors.toList());
    }

    public List<TransactionEntity> getUserTransactions(Long userId) throws Exception {
        userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        return transactionRepository.findByUserId(userId);
    }

    @Transactional
    public void softDeleteUser(Long userId, Long adminId) throws Exception {
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        user.setActive(false);
        userRepository.save(user);
        if (adminId != null) {
            auditLogService.record(adminId, "SOFT_DELETE_USER", "User", userId, "Soft deleted user");
        }
    }

    @Transactional
    public void changeUserRole(Long userId, String newRole, Long adminId) throws Exception {
        if (newRole == null) throw new Exception("Missing role");
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        String oldRole = user.getRole();
        user.setRole(newRole.toUpperCase());
        userRepository.save(user);
        if (adminId != null) {
            auditLogService.record(adminId, "CHANGE_ROLE", "User", userId,
                    "Role changed from " + oldRole + " to " + newRole.toUpperCase());
        }
    }

    @Transactional
    public void setUserBanned(Long userId, boolean banned, Long adminId) throws Exception {
        UserEntity user = userRepository.findById(userId).orElseThrow(() -> new Exception("User not found"));
        user.setActive(!banned);
        userRepository.save(user);
        if (adminId != null) {
            auditLogService.record(adminId, banned ? "BAN_USER" : "UNBAN_USER", "User", userId,
                    (banned ? "Banned" : "Unbanned") + " user");
        }
    }
}

