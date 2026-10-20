package com.example.FinanceAssist.service;

import com.example.FinanceAssist.dto.FinancialHealthScoreResponse;
import com.example.FinanceAssist.dto.GoalProjectionResponse;
import com.example.FinanceAssist.model.FinancialGoal;
import com.example.FinanceAssist.repository.FinancialGoalRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class GoalService {
    private final FinancialGoalRepository goalRepository;
    private final FinancialHealthService healthService;

    public GoalService(FinancialGoalRepository goalRepository, FinancialHealthService healthService) {
        this.goalRepository = goalRepository;
        this.healthService = healthService;
    }

    public List<FinancialGoal> findByUserId(String userId) {
        return goalRepository.findByUserId(userId);
    }

    public Optional<FinancialGoal> findById(String id) {
        return goalRepository.findById(id);
    }

    public FinancialGoal save(FinancialGoal goal) {
        return goalRepository.save(goal);
    }

    public void delete(String id) {
        goalRepository.deleteById(id);
    }

    public GoalProjectionResponse getProjection(String goalId, BigDecimal extraMonthlySaving, BigDecimal lumpSum) {
        FinancialGoal goal = goalRepository.findById(goalId)
            .orElseThrow(() -> new RuntimeException("Goal not found"));

        FinancialHealthScoreResponse health = healthService.calculateScore(goal.getUserId());
        
        // 1. Determine Monthly Surplus (from Health Score)
        BigDecimal monthlySurplus = health.getBreakdown().getIncome()
            .subtract(health.getBreakdown().getIncome().multiply(BigDecimal.valueOf(1.0 - health.getBreakdown().getSavingsRate() / 100.0)));
        
        // Add user-provided simulation values
        BigDecimal totalMonthlySurplus = monthlySurplus.add(extraMonthlySaving != null ? extraMonthlySaving : BigDecimal.ZERO);
        BigDecimal currentBalance = goal.getCurrentAmount().add(lumpSum != null ? lumpSum : BigDecimal.ZERO);
        
        List<GoalProjectionResponse.ProjectionPoint> points = new ArrayList<>();
        LocalDate now = LocalDate.now();
        LocalDate targetDate = goal.getTargetDate();
        long monthsToTarget = ChronoUnit.MONTHS.between(now, targetDate);
        if (monthsToTarget <= 0) monthsToTarget = 12; // Default to 12 if date is in past or soon

        BigDecimal currentValue = currentBalance;
        BigDecimal targetAmount = goal.getTargetAmount();
        double annualReturn = 0.07; // 7% base Conservative/Moderate return
        BigDecimal monthlyRate = BigDecimal.valueOf(1 + (annualReturn / 12.0));

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM yyyy");

        boolean reached = false;
        long monthCount = 0;
        
        // Project for either goal completion or up to 10 years (120 months)
        while (monthCount < 120 && (monthCount <= monthsToTarget || !reached)) {
            // Apply monthly return on current value + add surplus
            currentValue = currentValue.multiply(monthlyRate).add(totalMonthlySurplus);
            
            String label = now.plusMonths(monthCount).format(formatter);
            points.add(new GoalProjectionResponse.ProjectionPoint(label, currentValue.setScale(2, RoundingMode.HALF_UP), targetAmount));
            
            if (currentValue.compareTo(targetAmount) >= 0) reached = true;
            monthCount++;
            
            // Stop early if reached and past the target date
            if (reached && monthCount > monthsToTarget) break;
        }

        // AI Advice Generation
        String advice;
        double feasibilityScore;
        if (reached && monthCount <= monthsToTarget) {
            feasibilityScore = 90.0;
            advice = "On Track! You are currently Projected to reach this goal by " + now.plusMonths(monthCount-1).format(formatter) + ". This is ahead of your schedule!";
        } else if (reached) {
            feasibilityScore = 60.0;
            advice = "Caution: Based on current trends, you will reach this goal around " + now.plusMonths(monthCount-1).format(formatter) + ". Try increasing savings by ₹" + 
                     targetAmount.subtract(currentValue).divide(BigDecimal.valueOf(Math.max(monthsToTarget, 1)), 2, RoundingMode.HALF_UP).toPlainString() + " monthly to hit your deadline.";
        } else {
            feasibilityScore = 30.0;
            advice = "Your current savings rate is insufficient for the ₹" + targetAmount.toPlainString() + " target within this timeframe. Consider extending the deadline or automating a larger surplus.";
        }

        return new GoalProjectionResponse(goalId, points, advice, feasibilityScore);
    }
}
