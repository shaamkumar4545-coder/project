package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.dto.SubscriptionIntelligenceResponse;
import com.example.FinanceAssist.service.SubscriptionService;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/subscriptions")
@CrossOrigin(origins = "http://localhost:5173")
public class SubscriptionController {
    private final SubscriptionService subscriptionService;

    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/intelligence/{userId}")
    public List<SubscriptionIntelligenceResponse> getAudit(@PathVariable String userId) {
        return subscriptionService.getAudit(userId);
    }

    @PostMapping("/exorcise/all/{userId}")
    public void exorciseAll(@PathVariable String userId) {
        subscriptionService.exorciseAll(userId);
    }

    @PostMapping("/exorcise/{userId}")
    public void exorcise(@PathVariable String userId, @RequestParam String title) {
        subscriptionService.exorciseByTitle(userId, title);
    }
}
