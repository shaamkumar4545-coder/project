package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.service.AnalyticsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/analytics")
public class AnalyticsController {
    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/expense-trend")
    public ResponseEntity<?> getExpenseTrend(
            @RequestParam String userId,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getMonthWiseExpenseTrend(userId, months));
    }

    @GetMapping("/income-expense-comparison")
    public ResponseEntity<?> getIncomeExpenseComparison(
            @RequestParam String userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        return ResponseEntity.ok(analyticsService.getIncomeExpenseComparison(userId, year, month));
    }

    @GetMapping("/category-growth")
    public ResponseEntity<?> getCategoryGrowth(
            @RequestParam String userId,
            @RequestParam(defaultValue = "6") int months) {
        return ResponseEntity.ok(analyticsService.getCategoryGrowthAnalysis(userId, months));
    }

    @GetMapping("/savings-rate")
    public ResponseEntity<Map<String, Object>> getSavingsRate(
            @RequestParam String userId,
            @RequestParam int year,
            @RequestParam(required = false) Integer month) {
        double rate = analyticsService.calculateSavingsRate(userId, year, month);
        return ResponseEntity.ok(Map.of("savingsRate", rate));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<Map<String, Object>> getDashboard(
            @RequestParam String userId,
            @RequestParam(defaultValue = "6") int months,
            @RequestParam(defaultValue = "2026") int year) {
        return ResponseEntity.ok(Map.of(
            "expenseTrend", analyticsService.getMonthWiseExpenseTrend(userId, months),
            "incomeExpenseComparison", analyticsService.getIncomeExpenseComparison(userId, year, null),
            "categoryGrowth", analyticsService.getCategoryGrowthAnalysis(userId, months),
            "savingsRate", analyticsService.calculateSavingsRate(userId, year, null),
            "budgetInsights", analyticsService.getBudgetInsights(userId),
            "strategicAdvice", analyticsService.getStrategicAdvice(userId)
        ));
    }

    @GetMapping("/budget-insights")
    public ResponseEntity<?> getBudgetInsights(@RequestParam String userId) {
        return ResponseEntity.ok(analyticsService.getBudgetInsights(userId));
    }
}

