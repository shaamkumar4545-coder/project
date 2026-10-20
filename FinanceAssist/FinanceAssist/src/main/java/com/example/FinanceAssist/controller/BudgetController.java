package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.model.Budget;
import com.example.FinanceAssist.service.BudgetService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {
    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public List<Budget> all(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) return budgetService.findByUserId(userId);
        return budgetService.findAll();
    }

    @GetMapping("/month")
    public List<Budget> byMonthAndYear(
            @RequestParam String userId,
            @RequestParam Integer month,
            @RequestParam Integer year) {
        return budgetService.findByUserIdAndMonthAndYear(userId, month, year);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Budget> byId(@PathVariable String id) {
        return budgetService.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/with-alerts")
    public ResponseEntity<BudgetService.BudgetDTO> withAlerts(@PathVariable String id) {
        BudgetService.BudgetDTO dto = budgetService.getBudgetWithAlerts(id);
        if (dto == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/alerts")
    public ResponseEntity<Map<String, Object>> getAlerts(@RequestParam String userId) {
        List<BudgetService.BudgetDTO> budgets = budgetService.findByUserId(userId).stream()
            .map(b -> budgetService.getBudgetWithAlerts(b.getId()))
            .collect(Collectors.toList());
        
        List<BudgetService.BudgetDTO> warnings = budgets.stream()
            .filter(b -> "warning".equals(b.getAlertStatus()))
            .collect(Collectors.toList());
        
        List<BudgetService.BudgetDTO> exceeded = budgets.stream()
            .filter(b -> "exceeded".equals(b.getAlertStatus()))
            .collect(Collectors.toList());
        
        return ResponseEntity.ok(Map.of(
            "warnings", warnings,
            "exceeded", exceeded,
            "total", budgets.size()
        ));
    }

    @PostMapping
    public ResponseEntity<Budget> create(@Valid @RequestBody Budget budget) {
        Budget saved = budgetService.save(budget);
        return ResponseEntity.created(URI.create("/api/budgets/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Budget> update(@PathVariable String id, @Valid @RequestBody Budget budget) {
        return budgetService.findById(id)
                .map(existing -> {
                    budget.setId(id);
                    return ResponseEntity.ok(budgetService.save(budget));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (budgetService.findById(id).isEmpty()) return ResponseEntity.notFound().build();
        budgetService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
