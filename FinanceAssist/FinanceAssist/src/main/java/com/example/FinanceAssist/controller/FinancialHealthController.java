package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.dto.FinancialHealthScoreResponse;
import com.example.FinanceAssist.service.FinancialHealthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics/financial-health")
public class FinancialHealthController {

    private final FinancialHealthService financialHealthService;

    public FinancialHealthController(FinancialHealthService financialHealthService) {
        this.financialHealthService = financialHealthService;
    }

    @GetMapping
    public ResponseEntity<FinancialHealthScoreResponse> getFinancialHealthScore(@RequestParam String userId) {
        return ResponseEntity.ok(financialHealthService.calculateScore(userId));
    }
}
