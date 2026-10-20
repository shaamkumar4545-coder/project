package com.example.FinanceAssist.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/")
public class HealthController {

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "FinanceAssist API is running");
        response.put("endpoints", Map.of(
            "transactions", "/api/transactions",
            "users", "/api/users",
            "accounts", "/api/accounts",
            "budgets", "/api/budgets",
            "stats", "/api/transactions/stats"
        ));
        return ResponseEntity.ok(response);
    }
}

