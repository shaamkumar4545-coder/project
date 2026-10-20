package com.example.FinanceAssist.dto;

import java.math.BigDecimal;
import java.util.List;

public class GoalProjectionResponse {
    private String goalId;
    private List<ProjectionPoint> dataPoints;
    private String AIAdvice;
    private double feasibilityScore; // 0-100

    public GoalProjectionResponse(String goalId, List<ProjectionPoint> dataPoints, String AIAdvice, double feasibilityScore) {
        this.goalId = goalId;
        this.dataPoints = dataPoints;
        this.AIAdvice = AIAdvice;
        this.feasibilityScore = feasibilityScore;
    }

    public static class ProjectionPoint {
        private String label; // "Jan 2026"
        private BigDecimal projectedValue;
        private BigDecimal targetValue;

        public ProjectionPoint(String label, BigDecimal projectedValue, BigDecimal targetValue) {
            this.label = label;
            this.projectedValue = projectedValue;
            this.targetValue = targetValue;
        }

        public String getLabel() { return label; }
        public BigDecimal getProjectedValue() { return projectedValue; }
        public BigDecimal getTargetValue() { return targetValue; }
    }

    public String getGoalId() { return goalId; }
    public List<ProjectionPoint> getDataPoints() { return dataPoints; }
    public String getAIAdvice() { return AIAdvice; }
    public double getFeasibilityScore() { return feasibilityScore; }
}
