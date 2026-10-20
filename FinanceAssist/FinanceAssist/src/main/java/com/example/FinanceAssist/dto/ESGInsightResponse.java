package com.example.FinanceAssist.dto;

import java.util.List;

public class ESGInsightResponse {
    private double overallScore;
    private double environmentalScore;
    private double socialScore;
    private double governanceScore;
    private List<ESGBreakdown> assets;
    private List<String> insights;

    public ESGInsightResponse(double overallScore, double environmentalScore, double socialScore, double governanceScore, List<ESGBreakdown> assets, List<String> insights) {
        this.overallScore = overallScore;
        this.environmentalScore = environmentalScore;
        this.socialScore = socialScore;
        this.governanceScore = governanceScore;
        this.assets = assets;
        this.insights = insights;
    }

    public double getOverallScore() { return overallScore; }
    public double getEnvironmentalScore() { return environmentalScore; }
    public double getSocialScore() { return socialScore; }
    public double getGovernanceScore() { return governanceScore; }
    public List<ESGBreakdown> getAssets() { return assets; }
    public List<String> getInsights() { return insights; }

    public static class ESGBreakdown {
        private String name;
        private double score;
        private String impactLevel; // HIGH, MEDIUM, LOW

        public ESGBreakdown(String name, double score, String impactLevel) {
            this.name = name;
            this.score = score;
            this.impactLevel = impactLevel;
        }

        public String getName() { return name; }
        public double getScore() { return score; }
        public String getImpactLevel() { return impactLevel; }
    }
}
