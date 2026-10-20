package com.example.FinanceAssist.dto;

public class GreenFund {
    private String id;
    private String name;
    private String category;
    private double esgScore;
    private String description;
    private String yieldEstimate;
    private String iconType; // e.g., "WIND", "SUN", "LEAF", "WATER"

    public GreenFund(String id, String name, String category, double esgScore, String description, String yieldEstimate, String iconType) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.esgScore = esgScore;
        this.description = description;
        this.yieldEstimate = yieldEstimate;
        this.iconType = iconType;
    }

    // Getters
    public String getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public double getEsgScore() { return esgScore; }
    public String getDescription() { return description; }
    public String getYieldEstimate() { return yieldEstimate; }
    public String getIconType() { return iconType; }
}
