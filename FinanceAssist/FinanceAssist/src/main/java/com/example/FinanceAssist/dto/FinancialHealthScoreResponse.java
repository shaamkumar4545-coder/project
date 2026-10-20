package com.example.FinanceAssist.dto;

import java.math.BigDecimal;
import java.util.List;

public class FinancialHealthScoreResponse {
    private int overallScore;
    private ScoreBreakdown breakdown;
    private List<Quest> quests;
    private List<Badge> badges;

    public FinancialHealthScoreResponse(int overallScore, ScoreBreakdown breakdown, List<Quest> quests, List<Badge> badges) {
        this.overallScore = overallScore;
        this.breakdown = breakdown;
        this.quests = quests;
        this.badges = badges;
    }

    // Getters
    public int getOverallScore() { return overallScore; }
    public ScoreBreakdown getBreakdown() { return breakdown; }
    public List<Quest> getQuests() { return quests; }
    public List<Badge> getBadges() { return badges; }

    public static class ScoreBreakdown {
        private double savingsRate;
        private double budgetAdherence;
        private double investmentRatio;
        private double emergencyFundMonths;
        private BigDecimal income;
        private BigDecimal expenses;

        public ScoreBreakdown(double savingsRate, double budgetAdherence, double investmentRatio, double emergencyFundMonths, BigDecimal income, BigDecimal expenses) {
            this.savingsRate = savingsRate;
            this.budgetAdherence = budgetAdherence;
            this.investmentRatio = investmentRatio;
            this.emergencyFundMonths = emergencyFundMonths;
            this.income = income;
            this.expenses = expenses;
        }

        public double getSavingsRate() { return savingsRate; }
        public double getBudgetAdherence() { return budgetAdherence; }
        public double getInvestmentRatio() { return investmentRatio; }
        public double getEmergencyFundMonths() { return emergencyFundMonths; }
        public BigDecimal getIncome() { return income; }
        public BigDecimal getExpenses() { return expenses; }
    }

    public static class Quest {
        private String id;
        private String title;
        private String description;
        private String type; // SAVINGS, BUDGET, INVESTMENT, EMERGENCY
        private int pointsReward;

        public Quest(String id, String title, String description, String type, int pointsReward) {
            this.id = id;
            this.title = title;
            this.description = description;
            this.type = type;
            this.pointsReward = pointsReward;
        }

        public String getId() { return id; }
        public String getTitle() { return title; }
        public String getDescription() { return description; }
        public String getType() { return type; }
        public int getPointsReward() { return pointsReward; }
    }

    public static class Badge {
        private String name;
        private String icon;
        private String status; // LOCKED, UNLOCKED

        public Badge(String name, String icon, String status) {
            this.name = name;
            this.icon = icon;
            this.status = status;
        }

        public String getName() { return name; }
        public String getIcon() { return icon; }
        public String getStatus() { return status; }
    }
}
