package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.service.AnalyticsService;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class AIController {
    private final AnalyticsService analyticsService;

    public AIController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/context/{userId}")
    public Map<String, String> getContext(@PathVariable String userId) {
        String context = analyticsService.getFinancialContext(userId);
        return Map.of("context", context);
    }
}
