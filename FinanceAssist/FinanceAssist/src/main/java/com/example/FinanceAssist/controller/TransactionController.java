package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.service.TransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {
    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public List<Transaction> all(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String accountId,
            @RequestParam(required = false, defaultValue = "0") int page,
            @RequestParam(required = false, defaultValue = "50") int size
    ) {
        List<Transaction> transactions;
        if (accountId != null && !accountId.isBlank()) {
            transactions = transactionService.findByAccountId(accountId);
        } else if (userId != null && !userId.isBlank()) {
            transactions = transactionService.findByUserId(userId);
        } else {
            transactions = transactionService.findAll();
        }
        // Simple pagination (for production, use Pageable)
        int fromIndex = Math.min(page * size, transactions.size());
        int toIndex = Math.min(fromIndex + size, transactions.size());
        if (fromIndex >= transactions.size()) {
            return List.of();
        }
        return transactions.subList(fromIndex, toIndex);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Transaction> byId(@PathVariable String id) {
        return transactionService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transaction> create(@RequestBody Transaction tx) {
        // Set defaults for missing userId and accountId (for demo purposes)
        if (tx.getUserId() == null || tx.getUserId().isBlank()) {
            tx.setUserId("demo-user");
        }
        if (tx.getAccountId() == null || tx.getAccountId().isBlank()) {
            tx.setAccountId("demo-account");
        }
        // Map title to description if description is not set, and vice versa for consistency
        if (tx.getTitle() != null && !tx.getTitle().isBlank()) {
            if (tx.getDescription() == null || tx.getDescription().isBlank()) {
                tx.setDescription(tx.getTitle());
            }
        } else if (tx.getDescription() != null && !tx.getDescription().isBlank()) {
            tx.setTitle(tx.getDescription());
        }
        // Set default category if not provided
        if (tx.getCategory() == null || tx.getCategory().isBlank()) {
            tx.setCategory("General");
        }
        // Handle date - ensure it's set to current time if null
        if (tx.getDate() == null) {
            tx.setDate(Instant.now());
        }
        Transaction saved = transactionService.save(tx);
        return ResponseEntity.created(URI.create("/api/transactions/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable String id, @RequestBody Transaction tx) {
        return transactionService.findById(id)
                .map(existing -> {
                    tx.setId(id);
                    // Set default category if not provided
                    if (tx.getCategory() == null || tx.getCategory().isBlank()) {
                        tx.setCategory("General");
                    }
                    // Ensure date is set
                    if (tx.getDate() == null) {
                        tx.setDate(existing.getDate());
                    }
                    return ResponseEntity.ok(transactionService.save(tx));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (transactionService.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        transactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam(required = false) String userId) {
        List<Transaction> transactions;
        if (userId != null && !userId.isBlank()) {
            transactions = transactionService.findByUserId(userId);
        } else {
            transactions = transactionService.findAll();
        }
        
        Map<String, Object> stats = new HashMap<>();
        double totalIncome = transactions.stream()
            .filter(t -> "income".equals(t.getType()))
            .mapToDouble(t -> t.getAmount().doubleValue())
            .sum();
        double totalExpense = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .mapToDouble(t -> t.getAmount().doubleValue())
            .sum();
        double totalInvestment = transactions.stream()
            .filter(t -> "investment".equals(t.getType()))
            .mapToDouble(t -> t.getAmount().doubleValue())
            .sum();
        double balance = totalIncome - totalExpense - totalInvestment;
        
        // Category breakdown for expenses
        Map<String, Double> expenseByCategory = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(java.util.stream.Collectors.groupingBy(
                t -> t.getCategory() != null ? t.getCategory() : "General",
                java.util.stream.Collectors.summingDouble(t -> t.getAmount().doubleValue())
            ));
        
        stats.put("totalIncome", totalIncome);
        stats.put("totalExpense", totalExpense);
        stats.put("totalInvestment", totalInvestment);
        stats.put("balance", balance);
        stats.put("expenseByCategory", expenseByCategory);
        stats.put("totalTransactions", transactions.size());
        
        return ResponseEntity.ok(stats);
    }
}
