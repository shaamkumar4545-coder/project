package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.service.TaxCalculatorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/tax")
public class TaxCalculatorController {
    private final TaxCalculatorService taxCalculatorService;

    public TaxCalculatorController(TaxCalculatorService taxCalculatorService) {
        this.taxCalculatorService = taxCalculatorService;
    }

    @PostMapping("/calculate/old-regime")
    public ResponseEntity<?> calculateOldRegime(
            @RequestParam BigDecimal annualIncome,
            @RequestBody(required = false) TaxCalculatorService.TaxDeductions deductions) {
        if (deductions == null) {
            deductions = new TaxCalculatorService.TaxDeductions();
        }
        return ResponseEntity.ok(taxCalculatorService.calculateOldRegimeTax(annualIncome, deductions));
    }

    @PostMapping("/calculate/new-regime")
    public ResponseEntity<?> calculateNewRegime(@RequestParam BigDecimal annualIncome) {
        return ResponseEntity.ok(taxCalculatorService.calculateNewRegimeTax(annualIncome));
    }

    @PostMapping("/compare")
    public ResponseEntity<?> compareRegimes(
            @RequestParam BigDecimal annualIncome,
            @RequestBody(required = false) TaxCalculatorService.TaxDeductions deductions) {
        if (deductions == null) {
            deductions = new TaxCalculatorService.TaxDeductions();
        }
        return ResponseEntity.ok(taxCalculatorService.compareRegimes(annualIncome, deductions));
    }
}

