package com.example.FinanceAssist.dto;

import java.math.BigDecimal;

public class SubscriptionIntelligenceResponse {
    private String title;
    private BigDecimal monthlyAmount;
    private BigDecimal annualDrain;
    private String category;
    private boolean isActive;
    private boolean isGhostCandidate;
    private long activeMonths;
    private String source; // "MANUAL" or "AI_DETECTED"
    private String reason; // Why it was flagged

    public SubscriptionIntelligenceResponse(String title, BigDecimal monthlyAmount, BigDecimal annualDrain, String category, boolean isActive, boolean isGhostCandidate, long activeMonths) {
        this(title, monthlyAmount, annualDrain, category, isActive, isGhostCandidate, activeMonths, "MANUAL", "Flagged based on recurring schedule");
    }

    public SubscriptionIntelligenceResponse(String title, BigDecimal monthlyAmount, BigDecimal annualDrain, String category, boolean isActive, boolean isGhostCandidate, long activeMonths, String source, String reason) {
        this.title = title;
        this.monthlyAmount = monthlyAmount;
        this.annualDrain = annualDrain;
        this.category = category;
        this.isActive = isActive;
        this.isGhostCandidate = isGhostCandidate;
        this.activeMonths = activeMonths;
        this.source = source;
        this.reason = reason;
    }

    public String getTitle() { return title; }
    public BigDecimal getMonthlyAmount() { return monthlyAmount; }
    public BigDecimal getAnnualDrain() { return annualDrain; }
    public String getCategory() { return category; }
    public boolean getIsActive() { return isActive; }
    public boolean getIsGhostCandidate() { return isGhostCandidate; }
    public long getActiveMonths() { return activeMonths; }
    public String getSource() { return source; }
    public String getReason() { return reason; }
}
