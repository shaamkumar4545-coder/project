package com.example.FinanceAssist.service;

import com.example.FinanceAssist.model.Budget;
import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.repository.BudgetRepository;
import com.example.FinanceAssist.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;

@Service
public class BudgetService {
    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<Budget> findAll() { return budgetRepository.findAll(); }
    public Optional<Budget> findById(String id) { return budgetRepository.findById(id); }
    public List<Budget> findByUserId(String userId) { return budgetRepository.findByUserId(userId); }
    
    public List<Budget> findByUserIdAndMonthAndYear(String userId, Integer month, Integer year) {
        return budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
    }

    public Budget save(Budget budget) {
        // Set month and year if not set (default to current month)
        if (budget.getMonth() == null || budget.getYear() == null) {
            LocalDate now = LocalDate.now();
            if (budget.getMonth() == null) budget.setMonth(now.getMonthValue());
            if (budget.getYear() == null) budget.setYear(now.getYear());
        }
        // Recalculate spent amount
        recalculateSpent(budget);
        return budgetRepository.save(budget);
    }

    public void deleteById(String id) { budgetRepository.deleteById(id); }

    // Recalculate spent amount for a budget based on transactions
    public void recalculateSpent(Budget budget) {
        LocalDate startOfMonth = LocalDate.of(budget.getYear(), budget.getMonth(), 1);
        LocalDate endOfMonth = startOfMonth.withDayOfMonth(startOfMonth.lengthOfMonth());
        
        Instant startInstant = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endOfMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        
        List<Transaction> expenses = transactionRepository.findByUserIdAndDateBetween(
            budget.getUserId(), startInstant, endInstant);
        
        BigDecimal spent = expenses.stream()
            .filter(t -> "expense".equals(t.getType()))
            .filter(t -> budget.getCategory().equals(t.getCategory()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        budget.setSpent(spent);
    }

    // Get budget with alert status
    public BudgetDTO getBudgetWithAlerts(String id) {
        Optional<Budget> budgetOpt = budgetRepository.findById(id);
        if (budgetOpt.isEmpty()) {
            return null;
        }
        Budget budget = budgetOpt.get();
        recalculateSpent(budget);
        budgetRepository.save(budget);
        
        return new BudgetDTO(budget);
    }

    // DTO for budget with alert information
    public static class BudgetDTO {
        private String id;
        private String userId;
        private String category;
        private BigDecimal limitAmount;
        private BigDecimal spent;
        private BigDecimal remaining;
        private double percentageUsed;
        private String alertStatus; // "safe", "warning", "exceeded"
        private Integer month;
        private Integer year;

        public BudgetDTO(Budget budget) {
            this.id = budget.getId();
            this.userId = budget.getUserId();
            this.category = budget.getCategory();
            this.limitAmount = budget.getLimitAmount();
            this.spent = budget.getSpent();
            this.remaining = budget.getLimitAmount().subtract(budget.getSpent());
            this.percentageUsed = budget.getLimitAmount().compareTo(BigDecimal.ZERO) > 0
                ? budget.getSpent().divide(budget.getLimitAmount(), 4, java.math.RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;
            this.month = budget.getMonth();
            this.year = budget.getYear();
            
            if (percentageUsed >= 100) {
                this.alertStatus = "exceeded";
            } else if (percentageUsed >= 80) {
                this.alertStatus = "warning";
            } else {
                this.alertStatus = "safe";
            }
        }

        // Getters
        public String getId() { return id; }
        public String getUserId() { return userId; }
        public String getCategory() { return category; }
        public BigDecimal getLimitAmount() { return limitAmount; }
        public BigDecimal getSpent() { return spent; }
        public BigDecimal getRemaining() { return remaining; }
        public double getPercentageUsed() { return percentageUsed; }
        public String getAlertStatus() { return alertStatus; }
        public Integer getMonth() { return month; }
        public Integer getYear() { return year; }
    }
}
