package com.example.FinanceAssist.service;

import com.example.FinanceAssist.dto.SubscriptionIntelligenceResponse;
import com.example.FinanceAssist.model.RecurringTransaction;
import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.repository.RecurringTransactionRepository;
import com.example.FinanceAssist.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SubscriptionService {
    private final RecurringTransactionRepository repository;
    private final TransactionRepository transactionRepository;

    public SubscriptionService(RecurringTransactionRepository repository, TransactionRepository transactionRepository) {
        this.repository = repository;
        this.transactionRepository = transactionRepository;
    }

    public List<SubscriptionIntelligenceResponse> getAudit(String userId) {
        List<SubscriptionIntelligenceResponse> result = new ArrayList<>();
        
        // 1. Process Manually Marked Recurring Transactions
        List<RecurringTransaction> recurrings = repository.findByUserId(userId);
        for (RecurringTransaction rt : recurrings) {
            if (!"expense".equalsIgnoreCase(rt.getType()) || !Boolean.TRUE.equals(rt.getIsActive())) continue;

            BigDecimal monthlyAmount = calculateMonthlyAmount(rt);
            BigDecimal annualDrain = calculateAnnualDrain(rt);
            long activeMonths = ChronoUnit.MONTHS.between(rt.getStartDate(), LocalDate.now());
            
            // Lowered threshold: 3 months instead of 6, or 1 month for suspect categories
            boolean isGhostCandidate = activeMonths >= 3 || 
                                      (activeMonths >= 1 && isSuspectCategory(rt.getCategory()));

            result.add(new SubscriptionIntelligenceResponse(
                rt.getTitle(),
                monthlyAmount,
                annualDrain,
                rt.getCategory(),
                rt.getIsActive(),
                isGhostCandidate,
                activeMonths,
                "MANUAL",
                isGhostCandidate ? "Active for " + activeMonths + " months. Consider if still needed." : "Monitored recurring item"
            ));
        }

        // 2. AI Auto-Detection from regular transactions
        result.addAll(findAutoDetectedSubscriptions(userId));

        return result;
    }

    private List<SubscriptionIntelligenceResponse> findAutoDetectedSubscriptions(String userId) {
        List<SubscriptionIntelligenceResponse> detected = new ArrayList<>();
        
        // Scan last 90 days
        Instant ninetyDaysAgo = LocalDate.now().minusDays(90).atStartOfDay(ZoneId.systemDefault()).toInstant();
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(userId, ninetyDaysAgo, Instant.now());
        
        // Group by title and approximate amount (to handle slight variants)
        Map<String, List<Transaction>> groups = transactions.stream()
            .filter(t -> "expense".equalsIgnoreCase(t.getType()))
            .collect(Collectors.groupingBy(t -> t.getTitle().toLowerCase().trim()));

        for (Map.Entry<String, List<Transaction>> entry : groups.entrySet()) {
            List<Transaction> items = entry.getValue();
            if (items.size() < 2) continue; // Need at least 2 occurrences

            // Check if they occur in different months
            Set<Integer> months = items.stream()
                .map(t -> LocalDate.ofInstant(t.getDate(), ZoneId.systemDefault()).getMonthValue())
                .collect(Collectors.toSet());

            if (months.size() >= 2) {
                // Potential subscription detected!
                Transaction latest = items.get(0);
                BigDecimal avgAmount = items.stream()
                    .map(Transaction::getAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add)
                    .divide(BigDecimal.valueOf(items.size()), 2, BigDecimal.ROUND_HALF_UP);

                // If it's already in the manual list, skip it (rudimentary title check)
                // This is a simple version; real systems would use IDs or fuzzy matching
                
                boolean isSuspect = isSuspectCategory(latest.getCategory()) || 
                                   latest.getTitle().toLowerCase().contains("netflix") || 
                                   latest.getTitle().toLowerCase().contains("spotify") ||
                                   latest.getTitle().toLowerCase().contains("amazon") ||
                                   latest.getTitle().toLowerCase().contains("hulu");

                detected.add(new SubscriptionIntelligenceResponse(
                    latest.getTitle(),
                    avgAmount,
                    avgAmount.multiply(BigDecimal.valueOf(12)),
                    latest.getCategory(),
                    true,
                    isSuspect, // Auto-detected suspect categories are candidates
                    months.size(),
                    "AI_DETECTED",
                    "Pattern detected: Found " + items.size() + " occurrences in " + months.size() + " different months."
                ));
            }
        }

        return detected;
    }

    private BigDecimal calculateMonthlyAmount(RecurringTransaction rt) {
        switch (rt.getFrequency().toLowerCase()) {
            case "daily": return rt.getAmount().multiply(BigDecimal.valueOf(30));
            case "weekly": return rt.getAmount().multiply(BigDecimal.valueOf(4));
            case "monthly":
            default: return rt.getAmount();
        }
    }

    private BigDecimal calculateAnnualDrain(RecurringTransaction rt) {
        switch (rt.getFrequency().toLowerCase()) {
            case "daily": return rt.getAmount().multiply(BigDecimal.valueOf(365));
            case "weekly": return rt.getAmount().multiply(BigDecimal.valueOf(52));
            case "monthly":
            default: return rt.getAmount().multiply(BigDecimal.valueOf(12));
        }
    }

    private boolean isSuspectCategory(String category) {
        if (category == null) return false;
        String cat = category.toLowerCase();
        return cat.contains("subscription") || cat.contains("entertainment") || cat.contains("saas") || cat.contains("software") || cat.contains("misc");
    }

    public void exorciseAll(String userId) {
        List<RecurringTransaction> recurrings = repository.findByUserId(userId);
        for (RecurringTransaction rt : recurrings) {
            if (rt == null || rt.getStartDate() == null) continue;
            
            long activeMonths = ChronoUnit.MONTHS.between(rt.getStartDate(), LocalDate.now());
            boolean isGhost = activeMonths >= 3 || (activeMonths >= 1 && isSuspectCategory(rt.getCategory()));
            
            if (isGhost && Boolean.TRUE.equals(rt.getIsActive())) {
                rt.setIsActive(false);
                rt.setUpdatedAt(Instant.now());
                repository.save(rt);
            }
        }
    }

    public void exorciseByTitle(String userId, String title) {
        if (title == null) return;
        List<RecurringTransaction> recurrings = repository.findByUserId(userId);
        boolean found = false;
        for (RecurringTransaction rt : recurrings) {
            if (rt != null && title.equalsIgnoreCase(rt.getTitle())) {
                rt.setIsActive(false);
                rt.setUpdatedAt(Instant.now());
                repository.save(rt);
                found = true;
            }
        }
        
        // If it's an AI detected one (no recurring entry found), we don't have a way to 'deactivate' it yet
        // except by muting it or deleting the original transactions. 
        // For now, we just ensure it doesn't crash.
    }
}
