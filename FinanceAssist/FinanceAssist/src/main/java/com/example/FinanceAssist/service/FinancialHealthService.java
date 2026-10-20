package com.example.FinanceAssist.service;

import com.example.FinanceAssist.dto.FinancialHealthScoreResponse;
import com.example.FinanceAssist.model.Budget;
import com.example.FinanceAssist.model.Investment;
import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.repository.BudgetRepository;
import com.example.FinanceAssist.repository.InvestmentRepository;
import com.example.FinanceAssist.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

@Service
public class FinancialHealthService {
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final InvestmentRepository investmentRepository;

    public FinancialHealthService(TransactionRepository transactionRepository, 
                                  BudgetRepository budgetRepository, 
                                  InvestmentRepository investmentRepository) {
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.investmentRepository = investmentRepository;
    }

    public FinancialHealthScoreResponse calculateScore(String userId) {
        LocalDate now = LocalDate.now();
        int month = now.getMonthValue();
        int year = now.getYear();

        // 1. Get Income & Expenses for current month focusing on UTC range
        LocalDate startOfMonth = now.with(TemporalAdjusters.firstDayOfMonth());
        LocalDate endOfMonth = now.with(TemporalAdjusters.lastDayOfMonth());

        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(
            userId, 
            startOfMonth.atStartOfDay(ZoneOffset.UTC).toInstant(),
            endOfMonth.atTime(23, 59, 59).atOffset(ZoneOffset.UTC).toInstant()
        );

        BigDecimal income = transactions.stream()
            .filter(t -> "income".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal expensesCurrent = transactions.stream()
            .filter(t -> "expense".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Score Breakdown Calculation
        int totalScore = 0;
        
        // A. Savings Rate (30%)
        double savingsRate = 0.0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            savingsRate = income.subtract(expensesCurrent)
                .divide(income, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
        }
        int savingsScore = 0;
        if (savingsRate >= 25.0) savingsScore = 30;
        else if (savingsRate >= 15.0) savingsScore = 20;
        else if (savingsRate >= 0.0) savingsScore = 15; // Give baseline points if surplus
        totalScore += savingsScore;

        // B. Budget Adherence (30%)
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, month, year);
        double adherencePercent = 100.0;
        if (!budgets.isEmpty()) {
            long satisfied = budgets.stream()
                .filter(b -> b.getSpent().compareTo(b.getLimitAmount()) <= 0)
                .count();
            adherencePercent = (double) satisfied / budgets.size() * 100.0;
        }
        int budgetScore = 0;
        if (adherencePercent == 100.0) budgetScore = 30;
        else if (adherencePercent >= 80.0) budgetScore = 20;
        else if (adherencePercent >= 50.0) budgetScore = 10;
        totalScore += budgetScore;

        // C. Investment Ratio (20%)
        // Combined aggregation of Investment objects AND Transaction with type='investment'
        List<Investment> investments = investmentRepository.findByUserId(userId);
        BigDecimal investmentCollectionTotal = investments.stream()
            .map(Investment::getInvestedAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal investmentTransactionTotal = transactions.stream()
            .filter(t -> "investment".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalInvested = investmentCollectionTotal.add(investmentTransactionTotal);
        
        double investmentRatio = 0.0;
        if (income.compareTo(BigDecimal.ZERO) > 0) {
            investmentRatio = totalInvested.divide(income, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
        }

        int investScore = 0;
        if (investmentRatio >= 20.0) investScore = 20;
        else if (investmentRatio >= 10.0) investScore = 15;
        else if (investmentRatio > 0.0) investScore = 10; // Baseline for starting
        totalScore += investScore;

        // D. Emergency Fund (20%)
        List<Transaction> allTransactions = transactionRepository.findByUserId(userId);
        BigDecimal totalIncomeAll = allTransactions.stream()
            .filter(t -> "income".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalExpenseAll = allTransactions.stream()
            .filter(t -> "expense".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalInvestedAll = allTransactions.stream()
            .filter(t -> "investment".equalsIgnoreCase(t.getType()))
            .map(Transaction::getAmount).reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Correct Balance = Income - Expenses - Investments
        BigDecimal balance = totalIncomeAll.subtract(totalExpenseAll).subtract(totalInvestedAll);
        
        // Estimate avg expense from current month
        BigDecimal avgExpense = expensesCurrent.max(BigDecimal.valueOf(1000)); 
        
        double emergencyMonths = balance.divide(avgExpense, 2, RoundingMode.HALF_UP).doubleValue();
        int emergencyScore = 0;
        if (emergencyMonths >= 3.0) emergencyScore = 20;
        else if (emergencyMonths >= 1.0) emergencyScore = 10;
        else if (emergencyMonths >= 0.1) emergencyScore = 5;
        totalScore += emergencyScore;

        // Dynamic Quests
        List<FinancialHealthScoreResponse.Quest> quests = new ArrayList<>();
        if (savingsScore < 30) {
            quests.add(new FinancialHealthScoreResponse.Quest("q1", "Save ₹2,000 extra", "Cut discretionary spending this week to boost your savings rate.", "SAVINGS", 10));
        }
        if (budgetScore < 30) {
            quests.add(new FinancialHealthScoreResponse.Quest("q2", "Budget Master", "Stay within the limit for all categories this month.", "BUDGET", 15));
        }
        if (investScore < 20) {
            quests.add(new FinancialHealthScoreResponse.Quest("q3", "Start SIP", "Invest at least 15% of your income to secure your future.", "INVESTMENT", 20));
        }
        if (emergencyMonths < 3.0) {
            quests.add(new FinancialHealthScoreResponse.Quest("q4", "Safety First", "Save enough to cover 3 months of basic expenses.", "EMERGENCY", 25));
        }

        List<FinancialHealthScoreResponse.Badge> badges = new ArrayList<>();
        badges.add(new FinancialHealthScoreResponse.Badge("Budget Padawan", "Shield", budgetScore > 0 ? "UNLOCKED" : "LOCKED"));
        badges.add(new FinancialHealthScoreResponse.Badge("Wealth Builder", "TrendingUp", investScore >= 10 ? "UNLOCKED" : "LOCKED"));
        badges.add(new FinancialHealthScoreResponse.Badge("Financial Zen", "Crown", totalScore >= 90 ? "UNLOCKED" : "LOCKED"));

        return new FinancialHealthScoreResponse(
            Math.min(totalScore, 100),
            new FinancialHealthScoreResponse.ScoreBreakdown(savingsRate, adherencePercent, investmentRatio, emergencyMonths, income, expensesCurrent),
            quests,
            badges
        );
    }
}
