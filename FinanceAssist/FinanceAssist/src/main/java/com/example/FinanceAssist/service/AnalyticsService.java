package com.example.FinanceAssist.service;

import com.example.FinanceAssist.model.Budget;
import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.repository.BudgetRepository;
import com.example.FinanceAssist.repository.TransactionRepository;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AnalyticsService {
    private final TransactionRepository transactionRepository;
    private final BudgetRepository budgetRepository;
    private final MongoTemplate mongoTemplate;

    public AnalyticsService(TransactionRepository transactionRepository, BudgetRepository budgetRepository, MongoTemplate mongoTemplate) {
        this.transactionRepository = transactionRepository;
        this.budgetRepository = budgetRepository;
        this.mongoTemplate = mongoTemplate;
    }

    // Month-wise expense trend
    public List<MonthExpenseData> getMonthWiseExpenseTrend(String userId, int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months - 1);
        
        Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(
            userId, startInstant, endInstant);
        
        Map<String, BigDecimal> monthlyExpenses = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .collect(Collectors.groupingBy(
                t -> {
                    LocalDate date = LocalDate.ofInstant(t.getDate(), ZoneId.systemDefault());
                    return date.getYear() + "-" + String.format("%02d", date.getMonthValue());
                },
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));
        
        List<MonthExpenseData> result = new ArrayList<>();
        for (int i = months - 1; i >= 0; i--) {
            LocalDate month = endDate.minusMonths(i);
            String key = month.getYear() + "-" + String.format("%02d", month.getMonthValue());
            BigDecimal amount = monthlyExpenses.getOrDefault(key, BigDecimal.ZERO);
            result.add(new MonthExpenseData(month.getYear(), month.getMonthValue(), amount));
        }
        
        return result;
    }

    // Income vs Expense comparison
    public IncomeExpenseComparison getIncomeExpenseComparison(String userId, int year, Integer month) {
        LocalDate startDate, endDate;
        
        if (month != null) {
            startDate = LocalDate.of(year, month, 1);
            endDate = startDate.withDayOfMonth(startDate.lengthOfMonth());
        } else {
            startDate = LocalDate.of(year, 1, 1);
            endDate = LocalDate.of(year, 12, 31);
        }
        
        Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(
            userId, startInstant, endInstant);
        
        BigDecimal income = transactions.stream()
            .filter(t -> "income".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal expense = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        return new IncomeExpenseComparison(income, expense);
    }

    // Category growth analysis
    public List<CategoryGrowthData> getCategoryGrowthAnalysis(String userId, int months) {
        LocalDate endDate = LocalDate.now();
        LocalDate startDate = endDate.minusMonths(months - 1);
        
        Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        
        List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(
            userId, startInstant, endInstant);
        
        // Split into two periods for comparison
        LocalDate midDate = startDate.plusMonths(months / 2);
        Instant midInstant = midDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
        
        Map<String, BigDecimal> firstPeriod = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .filter(t -> t.getDate().isBefore(midInstant))
            .collect(Collectors.groupingBy(
                t -> t.getCategory() != null ? t.getCategory() : "General",
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));
        
        Map<String, BigDecimal> secondPeriod = transactions.stream()
            .filter(t -> "expense".equals(t.getType()))
            .filter(t -> !t.getDate().isBefore(midInstant))
            .collect(Collectors.groupingBy(
                t -> t.getCategory() != null ? t.getCategory() : "General",
                Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
            ));
        
        Set<String> allCategories = new HashSet<>(firstPeriod.keySet());
        allCategories.addAll(secondPeriod.keySet());
        
        List<CategoryGrowthData> result = new ArrayList<>();
        for (String category : allCategories) {
            BigDecimal first = firstPeriod.getOrDefault(category, BigDecimal.ZERO);
            BigDecimal second = secondPeriod.getOrDefault(category, BigDecimal.ZERO);
            String trend = second.compareTo(first) > 0 ? "↑" : "↓";
            result.add(new CategoryGrowthData(category, first, second, trend));
        }
        
        return result;
    }

    // Calculate savings rate
    public double calculateSavingsRate(String userId, int year, Integer month) {
        IncomeExpenseComparison comparison = getIncomeExpenseComparison(userId, year, month);
        if (comparison.getIncome().compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        BigDecimal savings = comparison.getIncome().subtract(comparison.getExpense());
        return savings.divide(comparison.getIncome(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    // New: Budget Analytics & Suggestions
    public List<BudgetInsight> getBudgetInsights(String userId) {
        LocalDate now = LocalDate.now();
        int currentMonth = now.getMonthValue();
        int currentYear = now.getYear();
        int currentDay = now.getDayOfMonth();
        int daysInMonth = now.with(TemporalAdjusters.lastDayOfMonth()).getDayOfMonth();

        // Fetch all budgets for the user for current month/year
        List<Budget> budgets = budgetRepository.findByUserIdAndMonthAndYear(userId, currentMonth, currentYear);
        
        List<BudgetInsight> insights = new ArrayList<>();

        for (Budget budget : budgets) {
            // Re-calculate spent amount on the fly to ensure accuracy
            recalculateBudgetSpent(budget);
            
            BigDecimal limit = budget.getLimitAmount();
            BigDecimal spent = budget.getSpent();
            
            if (limit == null || limit.compareTo(BigDecimal.ZERO) == 0) continue;
            if (spent == null) spent = BigDecimal.ZERO;

            double percent = spent.divide(limit, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue();
            
            // Projection based on spending rate
            BigDecimal projection = spent.divide(BigDecimal.valueOf(Math.max(currentDay, 1)), 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(daysInMonth));
            
            String status = "SAFE";
            String suggestion = "You're doing great with your " + budget.getCategory() + " budget! Keep it up.";

            if (percent >= 100) {
                status = "CRITICAL";
                suggestion = "Budget exceeded! Stop spending on " + budget.getCategory() + " immediately.";
            } else if (percent >= 80) {
                status = "WARNING";
                suggestion = "Watch out! You've used " + String.format("%.1f", percent) + "% of your " + budget.getCategory() + " budget. Only ₹" + limit.subtract(spent).setScale(2, RoundingMode.HALF_UP).toPlainString() + " left.";
            } else if (projection.compareTo(limit) > 0 && currentDay > 5) {
                status = "CAUTION";
                suggestion = "On track to overspend by ₹" + projection.subtract(limit).setScale(0, RoundingMode.HALF_UP).toPlainString() + " in " + budget.getCategory() + ". Try to reduce costs.";
            }

            insights.add(new BudgetInsight(
                budget.getCategory(), 
                limit, 
                spent, 
                percent, 
                projection, 
                suggestion, 
                status
            ));
        }
        
        // Sort by urgency: CRITICAL > WARNING > CAUTION > SAFE
        insights.sort((a, b) -> {
            Map<String, Integer> priority = Map.of("CRITICAL", 0, "WARNING", 1, "CAUTION", 2, "SAFE", 3);
            return priority.getOrDefault(a.status, 4) - priority.getOrDefault(b.status, 4);
        });

        return insights;
    }

    private void recalculateBudgetSpent(Budget budget) {
        LocalDate startOfMonth = LocalDate.of(budget.getYear(), budget.getMonth(), 1);
        LocalDate endOfMonth = startOfMonth.with(TemporalAdjusters.lastDayOfMonth());
        
        Instant startInstant = startOfMonth.atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endInstant = endOfMonth.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
        
        List<Transaction> expenses = transactionRepository.findByUserIdAndDateBetween(
            budget.getUserId(), startInstant, endInstant);
        
        BigDecimal spent = expenses.stream()
            .filter(t -> "expense".equals(t.getType()))
            .filter(t -> budget.getCategory().equalsIgnoreCase(t.getCategory()))
            .map(Transaction::getAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
    budget.setSpent(spent);
    }

    // Strategic AI Advice - Patterns and Suggestions
    public List<StrategicAdvice> getStrategicAdvice(String userId) {
        List<StrategicAdvice> adviceList = new ArrayList<>();
        LocalDate now = LocalDate.now();
        
        // 1. Savings Rate Analysis
        double currentSavingsRate = calculateSavingsRate(userId, now.getYear(), now.getMonthValue());
        if (currentSavingsRate < 15.0) {
            adviceList.add(new StrategicAdvice(
                "SAVINGS_LOW", 
                "Your savings rate is " + String.format("%.1f", currentSavingsRate) + "%, which is below the 20% targets. Try cutting discretionary costs to save an extra 5% this month.",
                "HIGH",
                "Target"
            ));
        } else if (currentSavingsRate > 25.0) {
            adviceList.add(new StrategicAdvice(
                "SAVINGS_HIGH", 
                "Outstanding saving! You have a " + String.format("%.1f", currentSavingsRate) + "% surplus. Consider growing it in the Investment tab.",
                "MEDIUM",
                "Invest"
            ));
        }

        // 2. Discretionary Growth Analysis
        List<CategoryGrowthData> growth = getCategoryGrowthAnalysis(userId, 2);
        List<String> discretionary = Arrays.asList("Shopping", "Entertainment", "Travel", "Dining", "Other", "Food");
        
        for (CategoryGrowthData data : growth) {
            if (discretionary.stream().anyMatch(cat -> cat.equalsIgnoreCase(data.getCategory()))) {
                if (data.getFirstPeriod().compareTo(BigDecimal.ZERO) > 0) {
                    double growthPercent = data.getSecondPeriod().subtract(data.getFirstPeriod())
                        .divide(data.getFirstPeriod(), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue();
                    
                    if (growthPercent > 15.0) {
                        adviceList.add(new StrategicAdvice(
                            "SPENDING_CONTROL", 
                            "High Growth! Your " + data.getCategory() + " spending is up " + String.format("%.1f", growthPercent) + "%. Control it to stay on track.",
                            "HIGH",
                            "Control"
                        ));
                    } else if (growthPercent < -10.0) {
                        adviceList.add(new StrategicAdvice(
                            "SAVINGS_SUCCESS", 
                            "Great job saving on " + data.getCategory() + "! You spent ₹" + data.getFirstPeriod().subtract(data.getSecondPeriod()).setScale(0, RoundingMode.HALF_UP).toPlainString() + " less than last month.",
                            "LOW",
                            "Save"
                        ));
                    }
                }
            }
        }

        // 3. Top Expense Analysis
        IncomeExpenseComparison comparison = getIncomeExpenseComparison(userId, now.getYear(), now.getMonthValue());
        if (comparison.getExpense().compareTo(BigDecimal.ZERO) > 0) {
            adviceList.add(new StrategicAdvice(
                "EFFICIENCY_TIP", 
                "Focus on small wins. Reducing your total monthly expenses by just 5% would save you ₹" + 
                comparison.getExpense().multiply(BigDecimal.valueOf(0.05)).setScale(0, RoundingMode.HALF_UP).toPlainString() + " extra.",
                "MEDIUM",
                "Efficiency"
            ));
        }

        if (adviceList.isEmpty()) {
            adviceList.add(new StrategicAdvice(
                "NEUTRAL", 
                "Keep tracking your expenses to build enough data for personalized AI financial coaching.",
                "LOW",
                "Insight"
            ));
        }

        return adviceList;
    }

    public static class StrategicAdvice {
        private String type; // SAVINGS_LOW, SPENDING_CONTROL, etc.
        private String message;
        private String impact; // HIGH, MEDIUM, LOW
        private String category; // Control, Save, Invest, etc. (for icons)

        public StrategicAdvice(String type, String message, String impact, String category) {
            this.type = type;
            this.message = message;
            this.impact = impact;
            this.category = category;
        }

        public String getType() { return type; }
        public String getMessage() { return message; }
        public String getImpact() { return impact; }
        public String getCategory() { return category; }
    }

    public static class BudgetInsight {
        private String category;
        private BigDecimal limitAmount;
        private BigDecimal spent;
        private double percentageUsed;
        private BigDecimal projectedSpend;
        private String suggestion;
        private String status;

        public BudgetInsight(String category, BigDecimal limitAmount, BigDecimal spent, double percentageUsed, BigDecimal projectedSpend, String suggestion, String status) {
            this.category = category;
            this.limitAmount = limitAmount;
            this.spent = spent;
            this.percentageUsed = percentageUsed;
            this.projectedSpend = projectedSpend;
            this.suggestion = suggestion;
            this.status = status;
        }

        public String getCategory() { return category; }
        public BigDecimal getLimitAmount() { return limitAmount; }
        public BigDecimal getSpent() { return spent; }
        public double getPercentageUsed() { return percentageUsed; }
        public BigDecimal getProjectedSpend() { return projectedSpend; }
        public String getSuggestion() { return suggestion; }
        public String getStatus() { return status; }
    }

    // DTOs
    public static class MonthExpenseData {
        private int year;
        private int month;
        private BigDecimal amount;

        public MonthExpenseData(int year, int month, BigDecimal amount) {
            this.year = year;
            this.month = month;
            this.amount = amount;
        }

        public int getYear() { return year; }
        public int getMonth() { return month; }
        public BigDecimal getAmount() { return amount; }
    }

    public static class IncomeExpenseComparison {
        private BigDecimal income;
        private BigDecimal expense;

        public IncomeExpenseComparison(BigDecimal income, BigDecimal expense) {
            this.income = income;
            this.expense = expense;
        }

        public BigDecimal getIncome() { return income; }
        public BigDecimal getExpense() { return expense; }
    }

    public static class CategoryGrowthData {
        private String category;
        private BigDecimal firstPeriod;
        private BigDecimal secondPeriod;
        private String trend;

        public CategoryGrowthData(String category, BigDecimal firstPeriod, BigDecimal secondPeriod, String trend) {
            this.category = category;
            this.firstPeriod = firstPeriod;
            this.secondPeriod = secondPeriod;
            this.trend = trend;
        }

        public String getCategory() { return category; }
        public BigDecimal getFirstPeriod() { return firstPeriod; }
        public BigDecimal getSecondPeriod() { return secondPeriod; }
        public String getTrend() { return trend; }
    }

    public String getFinancialContext(String userId) {
        LocalDate now = LocalDate.now();
        IncomeExpenseComparison comparison = getIncomeExpenseComparison(userId, now.getYear(), now.getMonthValue());
        List<Transaction> recent = transactionRepository.findTop10ByUserIdOrderByDateDesc(userId);
        List<BudgetInsight> budgets = getBudgetInsights(userId);

        StringBuilder sb = new StringBuilder();
        sb.append("--- FINANCIAL CONTEXT ---\n");
        sb.append("Current Month (").append(now.getMonth()).append("):\n");
        sb.append("- Total Income: ₹").append(comparison.getIncome()).append("\n");
        sb.append("- Total Expenses: ₹").append(comparison.getExpense()).append("\n");
        sb.append("- Savings Rate: ").append(String.format("%.1f%%", calculateSavingsRate(userId, now.getYear(), now.getMonthValue()))).append("\n\n");

        sb.append("Budget Status:\n");
        for (BudgetInsight b : budgets) {
            sb.append("- ").append(b.getCategory()).append(": ").append(b.getStatus()).append(" (").append(String.format("%.1f%%", b.getPercentageUsed())).append(" used)\n");
        }

        sb.append("\nRecent 10 Transactions:\n");
        for (Transaction t : recent) {
            sb.append("- ").append(t.getDate()).append(": ").append(t.getTitle()).append(" [").append(t.getCategory()).append("] ₹").append(t.getAmount()).append(" (").append(t.getType()).append(")\n");
        }
        sb.append("--- END CONTEXT ---");

        return sb.toString();
    }
}

