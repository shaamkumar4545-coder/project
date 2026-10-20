package com.example.FinanceAssist.service;

import com.example.FinanceAssist.dto.ESGInsightResponse;
import com.example.FinanceAssist.dto.GreenFund;
import com.example.FinanceAssist.model.Investment;
import com.example.FinanceAssist.repository.InvestmentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Service
public class ESGService {
    private final InvestmentRepository investmentRepository;

    public ESGService(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    public ESGInsightResponse getESGInsights(String userId) {
        List<Investment> investments = investmentRepository.findByUserId(userId);
        if (investments.isEmpty()) {
            return new ESGInsightResponse(0, 0, 0, 0, new ArrayList<>(), List.of("Add investments to see your ESG Pulse."));
        }

        double totalE = 0, totalS = 0, totalG = 0;
        BigDecimal totalInvested = BigDecimal.ZERO;
        List<ESGInsightResponse.ESGBreakdown> assets = new ArrayList<>();
        List<String> insights = new ArrayList<>();

        for (Investment inv : investments) {
            BigDecimal amount = inv.getInvestedAmount();
            totalInvested = totalInvested.add(amount);

            // Scoring Logic - Simplified Taxonomy
            double e = 50, s = 50, g = 50; // Base Neutral
            String name = inv.getAssetName().toLowerCase();
            String type = inv.getAssetType().toLowerCase();

            if (name.contains("solar") || name.contains("wind") || name.contains("green") || name.contains("clean")) {
                e = 95; s = 70; g = 80;
            } else if (name.contains("oil") || name.contains("gas") || name.contains("coal") || name.contains("mining")) {
                e = 10; s = 40; g = 50;
            } else if (name.contains("crypto") || name.contains("bitcoin") || name.contains("eth")) {
                e = 20; s = 50; g = 40; // Environmental concern due to energy
            } else if (name.contains("edu") || name.contains("health") || name.contains("med")) {
                e = 60; s = 90; g = 80;
            } else if (type.contains("gold")) {
                e = 40; s = 50; g = 90; // Governance heavy
            } else if (name.contains("apple") || name.contains("microsoft") || name.contains("google")) {
                e = 75; s = 70; g = 85; // Tech leaders
            }

            double avgScore = (e + s + g) / 3.0;
            totalE += e * amount.doubleValue();
            totalS += s * amount.doubleValue();
            totalG += g * amount.doubleValue();

            assets.add(new ESGInsightResponse.ESGBreakdown(
                inv.getAssetName(), 
                Math.round(avgScore), 
                avgScore > 75 ? "HIGH" : (avgScore < 40 ? "LOW" : "MEDIUM")
            ));
        }

        double finalE = totalE / totalInvested.doubleValue();
        double finalS = totalS / totalInvested.doubleValue();
        double finalG = totalG / totalInvested.doubleValue();
        double overall = (finalE + finalS + finalG) / 3.0;

        // Generate Insights
        if (finalE > 70) insights.add("🌿 Strong Environmental Pulse: Your portfolio is supporting green initiatives.");
        else if (finalE < 40) insights.add("⚠️ Carbon Risk: Consider increasing 'Green' assets to offset high-impact holdings.");
        
        if (finalS > 70) insights.add("🤝 Social Leader: You are invested in socially responsible projects.");
        
        if (overall > 80) insights.add("🏆 Ethical Gold: Your entire portfolio aligns with top-tier ESG standards.");
        else insights.add("💡 Recommendation: Explore ESG-specific Mutual Funds for balanced ethical growth.");

        return new ESGInsightResponse(
            Math.round(overall), 
            Math.round(finalE), 
            Math.round(finalS), 
            Math.round(finalG), 
            assets, 
            insights
        );
    }

    public List<GreenFund> getRecommendedGreenFunds() {
        return Arrays.asList(
            new GreenFund("GF01", "Aeolian Wind Power ETF", "Renewable Energy", 98, "Leading diversified wind energy generation across Northern Europe.", "6.2% Est.", "WIND"),
            new GreenFund("GF02", "Helios Solar Growth Fund", "Solar Innovation", 95, "Investing in high-efficiency photovoltaic infrastructure in emerging markets.", "7.5% Est.", "SUN"),
            new GreenFund("GF03", "Veridant Forestry Trust", "Conservation", 92, "Direct reforestation projects with verified carbon credit yields.", "4.8% Est.", "LEAF"),
            new GreenFund("GF04", "Aquilla Pure Water Index", "Resource Efficiency", 94, "Global pioneers in desalination and waste-water purification tech.", "5.9% Est.", "WATER")
        );
    }
}
