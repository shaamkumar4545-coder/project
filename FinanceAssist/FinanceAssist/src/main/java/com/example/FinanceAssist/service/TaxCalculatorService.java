package com.example.FinanceAssist.service;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class TaxCalculatorService {

    // Calculate tax for Old Regime
    public TaxCalculation calculateOldRegimeTax(BigDecimal annualIncome, TaxDeductions deductions) {
        BigDecimal taxableIncome = annualIncome.subtract(deductions.getTotalDeductions());
        
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal remaining = taxableIncome;
        
        // Tax slabs for FY 2024-25 (Old Regime)
        if (remaining.compareTo(BigDecimal.valueOf(250000)) > 0) {
            BigDecimal slab1 = remaining.min(BigDecimal.valueOf(250000));
            remaining = remaining.subtract(slab1);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal slab2 = remaining.min(BigDecimal.valueOf(250000)); // 2.5L to 5L
            tax = tax.add(slab2.multiply(BigDecimal.valueOf(0.05)));
            remaining = remaining.subtract(slab2);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal slab3 = remaining.min(BigDecimal.valueOf(500000)); // 5L to 10L
            tax = tax.add(slab3.multiply(BigDecimal.valueOf(0.20)));
            remaining = remaining.subtract(slab3);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            tax = tax.add(remaining.multiply(BigDecimal.valueOf(0.30))); // Above 10L
        }
        
        BigDecimal cess = tax.multiply(BigDecimal.valueOf(0.04)); // 4% cess
        BigDecimal totalTax = tax.add(cess);
        
        return new TaxCalculation(taxableIncome, tax, cess, totalTax, "old");
    }

    // Calculate tax for New Regime
    public TaxCalculation calculateNewRegimeTax(BigDecimal annualIncome) {
        BigDecimal taxableIncome = annualIncome;
        
        BigDecimal tax = BigDecimal.ZERO;
        BigDecimal remaining = taxableIncome;
        
        // Tax slabs for FY 2024-25 (New Regime)
        if (remaining.compareTo(BigDecimal.valueOf(300000)) > 0) {
            BigDecimal slab1 = remaining.min(BigDecimal.valueOf(300000));
            remaining = remaining.subtract(slab1);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal slab2 = remaining.min(BigDecimal.valueOf(300000)); // 3L to 6L
            tax = tax.add(slab2.multiply(BigDecimal.valueOf(0.05)));
            remaining = remaining.subtract(slab2);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal slab3 = remaining.min(BigDecimal.valueOf(400000)); // 6L to 9L
            tax = tax.add(slab3.multiply(BigDecimal.valueOf(0.10)));
            remaining = remaining.subtract(slab3);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal slab4 = remaining.min(BigDecimal.valueOf(300000)); // 9L to 12L
            tax = tax.add(slab4.multiply(BigDecimal.valueOf(0.15)));
            remaining = remaining.subtract(slab4);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal slab5 = remaining.min(BigDecimal.valueOf(300000)); // 12L to 15L
            tax = tax.add(slab5.multiply(BigDecimal.valueOf(0.20)));
            remaining = remaining.subtract(slab5);
        }
        
        if (remaining.compareTo(BigDecimal.ZERO) > 0) {
            tax = tax.add(remaining.multiply(BigDecimal.valueOf(0.30))); // Above 15L
        }
        
        BigDecimal cess = tax.multiply(BigDecimal.valueOf(0.04)); // 4% cess
        BigDecimal totalTax = tax.add(cess);
        
        return new TaxCalculation(taxableIncome, tax, cess, totalTax, "new");
    }

    // Compare both regimes
    public TaxComparison compareRegimes(BigDecimal annualIncome, TaxDeductions deductions) {
        TaxCalculation oldRegime = calculateOldRegimeTax(annualIncome, deductions);
        TaxCalculation newRegime = calculateNewRegimeTax(annualIncome);
        
        return new TaxComparison(oldRegime, newRegime);
    }

    // DTOs
    public static class TaxDeductions {
        private BigDecimal section80C = BigDecimal.ZERO; // Max 1.5L
        private BigDecimal section80D = BigDecimal.ZERO; // Health insurance
        private BigDecimal section24B = BigDecimal.ZERO; // Home loan interest
        private BigDecimal otherDeductions = BigDecimal.ZERO;

        public BigDecimal getTotalDeductions() {
            BigDecimal total = BigDecimal.ZERO;
            total = total.add(section80C.min(BigDecimal.valueOf(150000)));
            total = total.add(section80D);
            total = total.add(section24B);
            total = total.add(otherDeductions);
            return total;
        }

        // Getters and Setters
        public BigDecimal getSection80C() { return section80C; }
        public void setSection80C(BigDecimal section80C) { this.section80C = section80C; }
        
        public BigDecimal getSection80D() { return section80D; }
        public void setSection80D(BigDecimal section80D) { this.section80D = section80D; }
        
        public BigDecimal getSection24B() { return section24B; }
        public void setSection24B(BigDecimal section24B) { this.section24B = section24B; }
        
        public BigDecimal getOtherDeductions() { return otherDeductions; }
        public void setOtherDeductions(BigDecimal otherDeductions) { this.otherDeductions = otherDeductions; }
    }

    public static class TaxCalculation {
        private BigDecimal taxableIncome;
        private BigDecimal tax;
        private BigDecimal cess;
        private BigDecimal totalTax;
        private String regime;

        public TaxCalculation(BigDecimal taxableIncome, BigDecimal tax, BigDecimal cess, 
                             BigDecimal totalTax, String regime) {
            this.taxableIncome = taxableIncome;
            this.tax = tax;
            this.cess = cess;
            this.totalTax = totalTax;
            this.regime = regime;
        }

        public BigDecimal getTaxableIncome() { return taxableIncome; }
        public BigDecimal getTax() { return tax; }
        public BigDecimal getCess() { return cess; }
        public BigDecimal getTotalTax() { return totalTax; }
        public String getRegime() { return regime; }
    }

    public static class TaxComparison {
        private TaxCalculation oldRegime;
        private TaxCalculation newRegime;
        private String recommendedRegime;

        public TaxComparison(TaxCalculation oldRegime, TaxCalculation newRegime) {
            this.oldRegime = oldRegime;
            this.newRegime = newRegime;
            this.recommendedRegime = oldRegime.getTotalTax().compareTo(newRegime.getTotalTax()) < 0 
                ? "old" : "new";
        }

        public TaxCalculation getOldRegime() { return oldRegime; }
        public TaxCalculation getNewRegime() { return newRegime; }
        public String getRecommendedRegime() { return recommendedRegime; }
    }
}

