package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.model.RecurringTransaction;
import com.example.FinanceAssist.service.RecurringTransactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/recurring-transactions")
public class RecurringTransactionController {
    private final RecurringTransactionService recurringTransactionService;

    public RecurringTransactionController(RecurringTransactionService recurringTransactionService) {
        this.recurringTransactionService = recurringTransactionService;
    }

    @GetMapping
    public List<RecurringTransaction> all(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return recurringTransactionService.findByUserId(userId);
        }
        return recurringTransactionService.findAll();
    }

    @GetMapping("/active")
    public List<RecurringTransaction> active(@RequestParam String userId) {
        return recurringTransactionService.findByUserIdAndIsActive(userId, true);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecurringTransaction> byId(@PathVariable String id) {
        return recurringTransactionService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<RecurringTransaction> create(@Valid @RequestBody RecurringTransaction recurringTransaction) {
        RecurringTransaction saved = recurringTransactionService.save(recurringTransaction);
        return ResponseEntity.created(URI.create("/api/recurring-transactions/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecurringTransaction> update(@PathVariable String id, 
                                                      @Valid @RequestBody RecurringTransaction recurringTransaction) {
        return recurringTransactionService.findById(id)
            .map(existing -> {
                recurringTransaction.setId(id);
                return ResponseEntity.ok(recurringTransactionService.save(recurringTransaction));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/pause")
    public ResponseEntity<RecurringTransaction> pause(@PathVariable String id) {
        return recurringTransactionService.findById(id)
            .map(existing -> {
                existing.setIsActive(false);
                return ResponseEntity.ok(recurringTransactionService.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/resume")
    public ResponseEntity<RecurringTransaction> resume(@PathVariable String id) {
        return recurringTransactionService.findById(id)
            .map(existing -> {
                existing.setIsActive(true);
                return ResponseEntity.ok(recurringTransactionService.save(existing));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (recurringTransactionService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        recurringTransactionService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}

