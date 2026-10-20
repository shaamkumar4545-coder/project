package com.example.FinanceAssist.service;

import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.model.Investment;
import com.example.FinanceAssist.repository.TransactionRepository;
import com.example.FinanceAssist.repository.InvestmentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {
    private final TransactionRepository transactionRepository;
    private final InvestmentRepository investmentRepository;

    public ReportService(TransactionRepository transactionRepository, 
                        InvestmentRepository investmentRepository) {
        this.transactionRepository = transactionRepository;
        this.investmentRepository = investmentRepository;
    }

    // Year-wise income & expense comparison
    public List<YearFinancialData> getYearWiseComparison(String userId, int startYear, int endYear) {
        List<YearFinancialData> result = new ArrayList<>();
        
        for (int year = startYear; year <= endYear; year++) {
            LocalDate startDate = LocalDate.of(year, 1, 1);
            LocalDate endDate = LocalDate.of(year, 12, 31);
            
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
            
            BigDecimal savings = income.subtract(expense);
            
            result.add(new YearFinancialData(year, income, expense, savings));
        }
        
        return result;
    }

    // Net worth growth over time
    public List<NetWorthData> getNetWorthGrowth(String userId, int startYear, int endYear) {
        List<NetWorthData> result = new ArrayList<>();
        
        for (int year = startYear; year <= endYear; year++) {
            LocalDate endDate = LocalDate.of(year, 12, 31);
            Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
            
            // Calculate total income up to this year
            LocalDate startDate = LocalDate.of(startYear, 1, 1);
            Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
            
            List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(
                userId, startInstant, endInstant);
            
            BigDecimal totalIncome = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal totalExpense = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Calculate investment value
            List<Investment> investments = investmentRepository.findByUserId(userId);
            BigDecimal investmentValue = investments.stream()
                .map(inv -> inv.getCurrentValue() != null ? inv.getCurrentValue() : inv.getInvestedAmount())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal netWorth = totalIncome.subtract(totalExpense).add(investmentValue);
            
            result.add(new NetWorthData(year, netWorth, totalIncome, totalExpense, investmentValue));
        }
        
        return result;
    }

    // Tax paid history
    public List<TaxHistoryData> getTaxHistory(String userId, int startYear, int endYear) {
        List<TaxHistoryData> result = new ArrayList<>();
        
        for (int year = startYear; year <= endYear; year++) {
            LocalDate startDate = LocalDate.of(year, 1, 1);
            LocalDate endDate = LocalDate.of(year, 12, 31);
            
            Instant startInstant = startDate.atStartOfDay(ZoneId.systemDefault()).toInstant();
            Instant endInstant = endDate.atTime(23, 59, 59).atZone(ZoneId.systemDefault()).toInstant();
            
            List<Transaction> transactions = transactionRepository.findByUserIdAndDateBetween(
                userId, startInstant, endInstant);
            
            // Assuming tax is tracked as a transaction with category "Tax"
            BigDecimal taxPaid = transactions.stream()
                .filter(t -> "expense".equals(t.getType()))
                .filter(t -> "Tax".equalsIgnoreCase(t.getCategory()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            BigDecimal annualIncome = transactions.stream()
                .filter(t -> "income".equals(t.getType()))
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            result.add(new TaxHistoryData(year, annualIncome, taxPaid));
        }
        
        return result;
    }

    // Comprehensive financial report
    public FinancialReport getComprehensiveReport(String userId, int year) {
        YearFinancialData yearData = getYearWiseComparison(userId, year, year).get(0);
        List<NetWorthData> netWorthData = getNetWorthGrowth(userId, year - 2, year);
        TaxHistoryData taxData = getTaxHistory(userId, year, year).get(0);
        
        return new FinancialReport(year, yearData, netWorthData, taxData);
    }

    // DTOs
    public static class YearFinancialData {
        private int year;
        private BigDecimal income;
        private BigDecimal expense;
        private BigDecimal savings;

        public YearFinancialData(int year, BigDecimal income, BigDecimal expense, BigDecimal savings) {
            this.year = year;
            this.income = income;
            this.expense = expense;
            this.savings = savings;
        }

        public int getYear() { return year; }
        public BigDecimal getIncome() { return income; }
        public BigDecimal getExpense() { return expense; }
        public BigDecimal getSavings() { return savings; }
    }

    public static class NetWorthData {
        private int year;
        private BigDecimal netWorth;
        private BigDecimal totalIncome;
        private BigDecimal totalExpense;
        private BigDecimal investmentValue;

        public NetWorthData(int year, BigDecimal netWorth, BigDecimal totalIncome, 
                           BigDecimal totalExpense, BigDecimal investmentValue) {
            this.year = year;
            this.netWorth = netWorth;
            this.totalIncome = totalIncome;
            this.totalExpense = totalExpense;
            this.investmentValue = investmentValue;
        }

        public int getYear() { return year; }
        public BigDecimal getNetWorth() { return netWorth; }
        public BigDecimal getTotalIncome() { return totalIncome; }
        public BigDecimal getTotalExpense() { return totalExpense; }
        public BigDecimal getInvestmentValue() { return investmentValue; }
    }

    public static class TaxHistoryData {
        private int year;
        private BigDecimal annualIncome;
        private BigDecimal taxPaid;

        public TaxHistoryData(int year, BigDecimal annualIncome, BigDecimal taxPaid) {
            this.year = year;
            this.annualIncome = annualIncome;
            this.taxPaid = taxPaid;
        }

        public int getYear() { return year; }
        public BigDecimal getAnnualIncome() { return annualIncome; }
        public BigDecimal getTaxPaid() { return taxPaid; }
    }

    public static class FinancialReport {
        private int year;
        private YearFinancialData yearData;
        private List<NetWorthData> netWorthData;
        private TaxHistoryData taxData;

        public FinancialReport(int year, YearFinancialData yearData, 
                              List<NetWorthData> netWorthData, TaxHistoryData taxData) {
            this.year = year;
            this.yearData = yearData;
            this.netWorthData = netWorthData;
            this.taxData = taxData;
        }

        public int getYear() { return year; }
        public YearFinancialData getYearData() { return yearData; }
        public List<NetWorthData> getNetWorthData() { return netWorthData; }
        public TaxHistoryData getTaxData() { return taxData; }
    }
}

