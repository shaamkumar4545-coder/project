package com.example.FinanceAssist.service;

import com.example.FinanceAssist.model.RecurringTransaction;
import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.repository.RecurringTransactionRepository;
import com.example.FinanceAssist.repository.TransactionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class RecurringTransactionService {
    private final RecurringTransactionRepository recurringTransactionRepository;
    private final TransactionRepository transactionRepository;

    public RecurringTransactionService(
            RecurringTransactionRepository recurringTransactionRepository,
            TransactionRepository transactionRepository) {
        this.recurringTransactionRepository = recurringTransactionRepository;
        this.transactionRepository = transactionRepository;
    }

    public List<RecurringTransaction> findAll() {
        return recurringTransactionRepository.findAll();
    }

    public Optional<RecurringTransaction> findById(String id) {
        return recurringTransactionRepository.findById(id);
    }

    public List<RecurringTransaction> findByUserId(String userId) {
        return recurringTransactionRepository.findByUserId(userId);
    }

    public List<RecurringTransaction> findByUserIdAndIsActive(String userId, Boolean isActive) {
        return recurringTransactionRepository.findByUserIdAndIsActive(userId, isActive);
    }

    public RecurringTransaction save(RecurringTransaction recurringTransaction) {
        recurringTransaction.setUpdatedAt(Instant.now());
        return recurringTransactionRepository.save(recurringTransaction);
    }

    public void deleteById(String id) {
        recurringTransactionRepository.deleteById(id);
    }

    // Scheduled job to generate transactions (runs daily at midnight)
    @Scheduled(cron = "0 0 0 * * ?")
    public void generateRecurringTransactions() {
        LocalDate today = LocalDate.now();
        List<RecurringTransaction> activeRecurring = recurringTransactionRepository.findAll()
            .stream()
            .filter(rt -> rt.getIsActive() != null && rt.getIsActive())
            .filter(rt -> rt.getStartDate() != null && !rt.getStartDate().isAfter(today))
            .filter(rt -> rt.getEndDate() == null || !rt.getEndDate().isBefore(today))
            .toList();

        for (RecurringTransaction rt : activeRecurring) {
            if (shouldGenerateToday(rt, today)) {
                generateTransaction(rt, today);
            }
        }
    }

    private boolean shouldGenerateToday(RecurringTransaction rt, LocalDate today) {
        // Check if already generated today
        if (rt.getLastGeneratedDate() != null && rt.getLastGeneratedDate().equals(today)) {
            return false;
        }

        // Check frequency
        switch (rt.getFrequency().toLowerCase()) {
            case "daily":
                return true;
            case "weekly":
                // Generate on same day of week as start date
                return today.getDayOfWeek() == rt.getStartDate().getDayOfWeek();
            case "monthly":
                // Generate on same day of month as start date
                return today.getDayOfMonth() == rt.getStartDate().getDayOfMonth();
            default:
                return false;
        }
    }

    private void generateTransaction(RecurringTransaction rt, LocalDate date) {
        Transaction transaction = new Transaction();
        transaction.setUserId(rt.getUserId());
        transaction.setTitle(rt.getTitle());
        transaction.setAmount(rt.getAmount());
        transaction.setType(rt.getType());
        transaction.setCategory(rt.getCategory());
        transaction.setDescription(rt.getDescription());
        transaction.setAccountId(rt.getAccountId());
        transaction.setDate(date.atStartOfDay().toInstant(java.time.ZoneOffset.UTC));

        transactionRepository.save(transaction);

        // Update last generated date
        rt.setLastGeneratedDate(date);
        rt.setUpdatedAt(Instant.now());
        recurringTransactionRepository.save(rt);
    }
}

