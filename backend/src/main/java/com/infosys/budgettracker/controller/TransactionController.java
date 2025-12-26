

package com.infosys.budgettracker.controller;

import com.infosys.budgettracker.dto.TransactionDTO;
import com.infosys.budgettracker.model.TransactionEntity;
import com.infosys.budgettracker.service.TransactionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private TransactionService transactionService;

    // ✅ Add Transaction
    @PostMapping
    public ResponseEntity<?> addTransaction(@RequestBody TransactionEntity transaction,
                                            @RequestHeader("Authorization") String authHeader) {
        try {
            TransactionDTO saved = transactionService.addTransaction(transaction, authHeader);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🔄 Get All Transactions
    @GetMapping
    public ResponseEntity<?> getAllTransactions(@RequestHeader("Authorization") String authHeader) {
        try {
            List<TransactionDTO> transactions = transactionService.getAllTransactions(authHeader);
            return ResponseEntity.ok(transactions);
        } catch (Exception e) {
            return ResponseEntity.status(401).body(e.getMessage());
        }
    }

    // ✍️ Update Transaction
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTransaction(@PathVariable Long id,
                                               @RequestBody TransactionEntity updatedTransaction,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            TransactionDTO updated = transactionService.updateTransaction(id, updatedTransaction, authHeader);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 🗑️ Delete Transaction
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTransaction(@PathVariable Long id,
                                               @RequestHeader("Authorization") String authHeader) {
        try {
            transactionService.deleteTransaction(id, authHeader);
            return ResponseEntity.ok("Transaction deleted successfully!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
