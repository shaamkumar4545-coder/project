package com.example.FinanceAssist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "financial_goals")
public class FinancialGoal {
    @Id
    private String id;

    @NotBlank
    private String userId;

    @NotBlank
    private String title;

    @NotNull
    private BigDecimal targetAmount;

    @NotNull
    private LocalDate targetDate;

    private String category; // e.g. "House", "Car", "Retirement"

    private BigDecimal currentAmount = BigDecimal.ZERO;

    private BigDecimal monthlyContribution = BigDecimal.ZERO;

    public FinancialGoal() {}

    public FinancialGoal(String userId, String title, BigDecimal targetAmount, LocalDate targetDate, String category) {
        this.userId = userId;
        this.title = title;
        this.targetAmount = targetAmount;
        this.targetDate = targetDate;
        this.category = category;
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public BigDecimal getTargetAmount() { return targetAmount; }
    public void setTargetAmount(BigDecimal targetAmount) { this.targetAmount = targetAmount; }
    public LocalDate getTargetDate() { return targetDate; }
    public void setTargetDate(LocalDate targetDate) { this.targetDate = targetDate; }
    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }
    public BigDecimal getCurrentAmount() { return currentAmount; }
    public void setCurrentAmount(BigDecimal currentAmount) { this.currentAmount = currentAmount; }
    public BigDecimal getMonthlyContribution() { return monthlyContribution; }
    public void setMonthlyContribution(BigDecimal monthlyContribution) { this.monthlyContribution = monthlyContribution; }
}
