package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.model.Investment;
import com.example.FinanceAssist.service.InvestmentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/investments")
public class InvestmentController {
    private final InvestmentService investmentService;

    public InvestmentController(InvestmentService investmentService) {
        this.investmentService = investmentService;
    }

    @GetMapping
    public List<Investment> all(@RequestParam(required = false) String userId) {
        if (userId != null && !userId.isBlank()) {
            return investmentService.findByUserId(userId);
        }
        return investmentService.findAll();
    }

    @GetMapping("/type")
    public List<Investment> byType(@RequestParam String userId, @RequestParam String assetType) {
        return investmentService.findByUserIdAndAssetType(userId, assetType);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Investment> byId(@PathVariable String id) {
        return investmentService.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/profit-loss")
    public ResponseEntity<Map<String, Object>> getProfitLoss(@PathVariable String id) {
        return investmentService.findById(id)
            .map(investment -> {
                Map<String, Object> result = new HashMap<>();
                result.put("profitLoss", investmentService.calculateProfitLoss(investment));
                result.put("profitLossPercentage", investmentService.calculateProfitLossPercentage(investment));
                return ResponseEntity.ok(result);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/portfolio/summary")
    public ResponseEntity<InvestmentService.PortfolioSummary> getPortfolioSummary(@RequestParam String userId) {
        return ResponseEntity.ok(investmentService.getPortfolioSummary(userId));
    }

    @PostMapping
    public ResponseEntity<Investment> create(@Valid @RequestBody Investment investment) {
        Investment saved = investmentService.save(investment);
        return ResponseEntity.created(URI.create("/api/investments/" + saved.getId())).body(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Investment> update(@PathVariable String id, @Valid @RequestBody Investment investment) {
        return investmentService.findById(id)
            .map(existing -> {
                investment.setId(id);
                return ResponseEntity.ok(investmentService.save(investment));
            })
            .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (investmentService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        investmentService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/stocks/live-prices")
    public ResponseEntity<List<Map<String, Object>>> getLiveStockPrices() {
        List<Map<String, Object>> stockPrices = investmentService.fetchLiveStockPrices();
        return ResponseEntity.ok(stockPrices);
    }

    @PostMapping("/stocks/buy")
    public ResponseEntity<Map<String, Object>> buyStock(@RequestBody Map<String, Object> stockPurchaseRequest) {
        String userId = (String) stockPurchaseRequest.get("userId");
        String stockSymbol = (String) stockPurchaseRequest.get("stockSymbol");
        int quantity = (int) stockPurchaseRequest.get("quantity");
        
        if (userId == null || stockSymbol == null || quantity <= 0) {
            Map<String, Object> error = new HashMap<>();
            error.put("status", "error");
            error.put("message", "Invalid purchase request details");
            return ResponseEntity.badRequest().body(error);
        }
        
        Map<String, Object> purchaseResult = investmentService.buyStock(userId, stockSymbol, quantity);
        return ResponseEntity.ok(purchaseResult);
    }
}

