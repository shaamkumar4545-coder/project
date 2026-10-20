package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.dto.TaxFilingRequest;
import com.example.FinanceAssist.dto.TaxFilingResponse;
import com.example.FinanceAssist.model.TaxFiling;
import com.example.FinanceAssist.service.TaxFilingService;
import com.example.FinanceAssist.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tax-filing")
@CrossOrigin(origins = "*")
public class TaxFilingController {

    private final TaxFilingService taxFilingService;
    private final JwtUtil jwtUtil;

    public TaxFilingController(TaxFilingService taxFilingService, JwtUtil jwtUtil) {
        this.taxFilingService = taxFilingService;
        this.jwtUtil = jwtUtil;
    }

    // Create new filing
    @PostMapping
    public ResponseEntity<?> createFiling(@RequestBody TaxFilingRequest request, HttpServletRequest httpRequest) {
        try {
            String userId = extractUserId(httpRequest);
            TaxFilingResponse response = taxFilingService.createFiling(userId, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get all filings for user
    @GetMapping
    public ResponseEntity<?> getUserFilings(HttpServletRequest httpRequest) {
        try {
            String userId = extractUserId(httpRequest);
            List<TaxFiling> filings = taxFilingService.getUserFilings(userId);
            return ResponseEntity.ok(filings);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get filing by ID
    @GetMapping("/{id}")
    public ResponseEntity<?> getFilingById(@PathVariable String id) {
        try {
            TaxFilingResponse response = taxFilingService.getFilingById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Update filing
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFiling(@PathVariable String id, @RequestBody TaxFilingRequest request) {
        try {
            TaxFilingResponse response = taxFilingService.updateFiling(id, request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Delete filing
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFiling(@PathVariable String id) {
        try {
            taxFilingService.deleteFiling(id);
            return ResponseEntity.ok(Map.of("message", "Filing deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Auto-populate income from transactions
    @GetMapping("/auto-populate")
    public ResponseEntity<?> autoPopulate(@RequestParam String financialYear, HttpServletRequest httpRequest) {
        try {
            String userId = extractUserId(httpRequest);
            Map<String, BigDecimal> income = taxFilingService.autoPopulateIncome(userId, financialYear);
            return ResponseEntity.ok(income);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Compute tax for a filing
    @PostMapping("/{id}/compute")
    public ResponseEntity<?> computeTax(@PathVariable String id) {
        try {
            TaxFilingResponse response = taxFilingService.getFilingById(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Get filing summary
    @GetMapping("/{id}/summary")
    public ResponseEntity<?> getFilingSummary(@PathVariable String id) {
        try {
            Map<String, Object> summary = taxFilingService.generateFilingSummary(id);
            return ResponseEntity.ok(summary);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // Submit filing
    @PostMapping("/{id}/submit")
    public ResponseEntity<?> submitFiling(@PathVariable String id) {
        try {
            TaxFilingResponse response = taxFilingService.submitFiling(id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    private String extractUserId(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            return jwtUtil.extractUserId(token);
        }
        throw new RuntimeException("Authorization token is required");
    }
}
