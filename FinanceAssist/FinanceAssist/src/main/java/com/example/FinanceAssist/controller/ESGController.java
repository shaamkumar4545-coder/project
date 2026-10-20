package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.dto.ESGInsightResponse;
import com.example.FinanceAssist.dto.GreenFund;
import com.example.FinanceAssist.service.ESGService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/investments/esg-insights")
@CrossOrigin(origins = "http://localhost:5173")
public class ESGController {
    private final ESGService esgService;

    public ESGController(ESGService esgService) {
        this.esgService = esgService;
    }

    @GetMapping("/green-funds")
    public List<GreenFund> getGreenFunds() {
        return esgService.getRecommendedGreenFunds();
    }

    @GetMapping("/{userId}")
    public ESGInsightResponse getESGInsights(@PathVariable String userId) {
        return esgService.getESGInsights(userId);
    }
}
