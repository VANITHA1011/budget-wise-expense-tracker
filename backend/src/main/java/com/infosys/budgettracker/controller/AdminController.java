
package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.dto.UserAdminDTO;
import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.model.UserEntity;
import com.infosys.budgettracker.repository.TransactionRepository;
import com.infosys.budgettracker.repository.UserRepository;
import com.infosys.budgettracker.service.AdminService;
import com.opencsv.CSVWriter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, exposedHeaders = {"Content-Disposition", "Authorization"})
public class AdminController {

    private final AdminService adminService;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;

    public AdminController(AdminService adminService,
                           UserRepository userRepository,
                           TransactionRepository transactionRepository) {
        this.adminService = adminService;
        this.userRepository = userRepository;
        this.transactionRepository = transactionRepository;
    }

    /**
     * GET /api/admin/users
     * Optional query params:
     *  - search (string)
     *  - role  (ALL|ADMIN|USER|BANNED)  (case-insensitive)
     */
    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers(@RequestParam(value = "search", required = false) String search,
                                         @RequestParam(value = "role", required = false) String role) {
        try {
            if (role != null) {
                String r = role.trim().toUpperCase();
                if (r.equals("INACTIVE") || r.equals("DISABLED")) {
                    role = "BANNED";
                } else {
                    role = r;
                }
            }
            List<UserAdminDTO> users = adminService.getAllUsers(Optional.ofNullable(search), Optional.ofNullable(role));

            // Optional debug: System.out prints - remove or replace with logger if desired.
            System.out.println("[ADMIN] getAllUsers -> returned " + (users == null ? 0 : users.size())
                    + " users (requested role=" + role + ")");

            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/admin/users/{userId}/transactions
     */
    @GetMapping("/users/{userId}/transactions")
    public ResponseEntity<?> getUserTransactions(@PathVariable Long userId) {
        try {
            List<TransactionEntity> txs = adminService.getUserTransactions(userId);
            return ResponseEntity.ok(txs);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * CSV export: GET /api/admin/users/{userId}/transactions/export/csv
     */
    @GetMapping("/users/{userId}/transactions/export/csv")
    public void exportUserTransactionsCsv(@PathVariable Long userId, HttpServletResponse response) throws IOException {
        UserEntity user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            response.setStatus(HttpServletResponse.SC_NOT_FOUND);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"User not found\"}");
            return;
        }

        response.setContentType("text/csv; charset=UTF-8");
        String filename = "transactions_user_" + (user.getUsername() == null ? userId : user.getUsername()) + ".csv";
        String encoded = URLEncoder.encode(filename, StandardCharsets.UTF_8);
        response.setHeader("Content-Disposition", "attachment; filename=\"" + encoded + "\"");
        response.setCharacterEncoding(StandardCharsets.UTF_8.name());

        List<TransactionEntity> txs = transactionRepository.findByUserId(userId);

        try (var osw = new java.io.OutputStreamWriter(response.getOutputStream(), StandardCharsets.UTF_8);
             CSVWriter writer = new CSVWriter(osw,
                     CSVWriter.DEFAULT_SEPARATOR,
                     CSVWriter.DEFAULT_QUOTE_CHARACTER,
                     CSVWriter.DEFAULT_ESCAPE_CHARACTER,
                     CSVWriter.DEFAULT_LINE_END)) {

            writer.writeNext(new String[]{"Date", "Type", "Category", "Amount", "Description"});

            for (TransactionEntity t : txs) {
                String date = t.getDate() != null ? t.getDate().toString() : "";
                String type = t.getType() == null ? "" : t.getType();
                String category = t.getCategory() == null ? "" : t.getCategory();
                String amount = Objects.toString(t.getAmount(), "");
                String desc = t.getDescription() == null ? "" : t.getDescription();
                writer.writeNext(new String[]{date, type, category, amount, desc});
            }
            writer.flush();
        } catch (Exception e) {
            response.reset();
            response.setStatus(HttpServletResponse.SC_INTERNAL_SERVER_ERROR);
            response.setContentType("application/json");
            response.getWriter().write("{\"error\":\"Failed to export CSV: " + e.getMessage().replace("\"", "\\\"") + "\"}");
        }
    }

    /**
     * PUT /api/admin/users/{userId}/soft-delete
     */
    @PutMapping("/users/{userId}/soft-delete")
    public ResponseEntity<?> softDelete(@PathVariable Long userId) {
        try {
            adminService.softDeleteUser(userId, null);
            return ResponseEntity.ok(Map.of("message", "User soft-deleted"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/users/{userId}/role
     * Body: { "role": "ADMIN" }
     */
    @PutMapping("/users/{userId}/role")
    public ResponseEntity<?> changeRole(@PathVariable Long userId, @RequestBody Map<String, String> body) {
        try {
            String role = body == null ? null : body.get("role");
            if (role == null || role.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing role"));
            }
            adminService.changeUserRole(userId, role, null);
            return ResponseEntity.ok(Map.of("message", "Role changed"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/admin/users/{userId}/banned
     * Body: { "banned": true }
     */
    @PutMapping("/users/{userId}/banned")
    public ResponseEntity<?> setBanned(@PathVariable Long userId, @RequestBody Map<String, Object> body) {
        try {
            if (body == null || !body.containsKey("banned")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Missing 'banned' flag"));
            }
            Object bannedObj = body.get("banned");
            boolean banned;
            if (bannedObj instanceof Boolean) {
                banned = (Boolean) bannedObj;
            } else {
                banned = Boolean.parseBoolean(String.valueOf(bannedObj));
            }

            adminService.setUserBanned(userId, banned, null);
            return ResponseEntity.ok(Map.of("message", banned ? "User banned" : "User unbanned"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
