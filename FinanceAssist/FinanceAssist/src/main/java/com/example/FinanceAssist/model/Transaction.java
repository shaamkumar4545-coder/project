package com.example.FinanceAssist.model;

import java.math.BigDecimal;
import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Document(collection = "transactions")
public class Transaction {
    @Id
    private String id;

    private String userId;

    private String accountId;
    
    private String title; // Frontend uses 'title' instead of 'description'

    @NotNull
    private BigDecimal amount;

    @NotBlank
    private String type;

    private String category; // Optional - defaults to "General" in controller

    private String description;

    @NotNull
    private Instant date = Instant.now();

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAccountId() { return accountId; }
    public void setAccountId(String accountId) { this.accountId = accountId; }

    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getDate() { return date; }
    public void setDate(Instant date) { this.date = date; }
    
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
}
