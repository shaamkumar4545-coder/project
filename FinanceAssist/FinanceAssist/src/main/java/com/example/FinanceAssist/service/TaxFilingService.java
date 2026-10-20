package com.example.FinanceAssist.service;

import com.example.FinanceAssist.dto.TaxFilingRequest;
import com.example.FinanceAssist.dto.TaxFilingResponse;
import com.example.FinanceAssist.model.TaxFiling;
import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.repository.TaxFilingRepository;
import com.example.FinanceAssist.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.*;

@Service
public class TaxFilingService {

    private final TaxFilingRepository taxFilingRepository;
    private final TransactionRepository transactionRepository;
    private final TaxCalculatorService taxCalculatorService;

    public TaxFilingService(TaxFilingRepository taxFilingRepository,
                            TransactionRepository transactionRepository,
                            TaxCalculatorService taxCalculatorService) {
        this.taxFilingRepository = taxFilingRepository;
        this.transactionRepository = transactionRepository;
        this.taxCalculatorService = taxCalculatorService;
    }

    // Create a new filing
    public TaxFilingResponse createFiling(String userId, TaxFilingRequest request) {
        TaxFiling filing = new TaxFiling();
        filing.setUserId(userId);
        filing.setStatus("DRAFT");
        filing.setCreatedAt(Instant.now());
        mapRequestToFiling(request, filing);
        
        // Auto-determine ITR form
        filing.setItrFormType(recommendITRForm(filing));
        
        // Compute tax
        computeTax(filing);

        TaxFiling saved = taxFilingRepository.save(filing);
        
        TaxFilingResponse response = new TaxFilingResponse(saved, "Tax filing created successfully");
        response.setDocumentChecklist(generateDocChecklist(saved));
        response.setTaxSavingTips(generateTaxSavingTips(saved));
        return response;
    }

    // Update existing filing
    public TaxFilingResponse updateFiling(String filingId, TaxFilingRequest request) {
        TaxFiling filing = taxFilingRepository.findById(filingId)
                .orElseThrow(() -> new RuntimeException("Filing not found"));

        mapRequestToFiling(request, filing);
        filing.setUpdatedAt(Instant.now());
        filing.setItrFormType(recommendITRForm(filing));
        computeTax(filing);

        TaxFiling saved = taxFilingRepository.save(filing);

        TaxFilingResponse response = new TaxFilingResponse(saved, "Tax filing updated successfully");
        response.setDocumentChecklist(generateDocChecklist(saved));
        response.setTaxSavingTips(generateTaxSavingTips(saved));
        return response;
    }

    // Get filing by ID
    public TaxFilingResponse getFilingById(String filingId) {
        TaxFiling filing = taxFilingRepository.findById(filingId)
                .orElseThrow(() -> new RuntimeException("Filing not found"));

        TaxFilingResponse response = new TaxFilingResponse(filing, null);
        response.setDocumentChecklist(generateDocChecklist(filing));
        response.setTaxSavingTips(generateTaxSavingTips(filing));
        return response;
    }

    // Get all user filings
    public List<TaxFiling> getUserFilings(String userId) {
        return taxFilingRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    // Delete
    public void deleteFiling(String filingId) {
        taxFilingRepository.deleteById(filingId);
    }

    // Submit a filing
    public TaxFilingResponse submitFiling(String filingId) {
        TaxFiling filing = taxFilingRepository.findById(filingId)
                .orElseThrow(() -> new RuntimeException("Filing not found"));
        filing.setStatus("SUBMITTED");
        filing.setFilingDate(Instant.now());
        filing.setUpdatedAt(Instant.now());
        TaxFiling saved = taxFilingRepository.save(filing);
        return new TaxFilingResponse(saved, "Filing submitted successfully");
    }

    // Auto-populate from transactions
    public Map<String, BigDecimal> autoPopulateIncome(String userId, String financialYear) {
        // Parse financial year e.g. "2024-25" -> April 2024 to March 2025
        String[] parts = financialYear.split("-");
        int startYear = Integer.parseInt(parts[0]);

        LocalDate startDate = LocalDate.of(startYear, 4, 1);
        LocalDate endDate = LocalDate.of(startYear + 1, 3, 31);

        Instant start = startDate.atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();
        Instant end = endDate.plusDays(1).atStartOfDay(ZoneId.of("Asia/Kolkata")).toInstant();

        List<Transaction> transactions = transactionRepository.findByUserId(userId);

        BigDecimal totalIncome = BigDecimal.ZERO;
        BigDecimal salaryIncome = BigDecimal.ZERO;
        BigDecimal interestIncome = BigDecimal.ZERO;
        BigDecimal businessIncome = BigDecimal.ZERO;
        BigDecimal otherIncome = BigDecimal.ZERO;

        for (Transaction t : transactions) {
            if (t.getDate() == null) continue;
            if (t.getDate().isBefore(start) || t.getDate().isAfter(end)) continue;
            if (!"INCOME".equalsIgnoreCase(t.getType())) continue;

            BigDecimal amount = t.getAmount() != null ? t.getAmount() : BigDecimal.ZERO;
            totalIncome = totalIncome.add(amount);

            String category = t.getCategory() != null ? t.getCategory().toLowerCase() : "";
            if (category.contains("salary") || category.contains("wage")) {
                salaryIncome = salaryIncome.add(amount);
            } else if (category.contains("interest") || category.contains("dividend")) {
                interestIncome = interestIncome.add(amount);
            } else if (category.contains("business") || category.contains("freelance")) {
                businessIncome = businessIncome.add(amount);
            } else {
                otherIncome = otherIncome.add(amount);
            }
        }

        Map<String, BigDecimal> result = new LinkedHashMap<>();
        result.put("totalIncome", totalIncome);
        result.put("salaryIncome", salaryIncome);
        result.put("interestIncome", interestIncome);
        result.put("businessIncome", businessIncome);
        result.put("otherIncome", otherIncome);
        return result;
    }

    // Compute tax for both regimes
    public void computeTax(TaxFiling filing) {
        BigDecimal grossIncome = safe(filing.getSalaryIncome())
                .subtract(safe(filing.getHraExemption()))
                .subtract(safe(filing.getLtaExemption()))
                .subtract(safe(filing.getStandardDeduction()))
                .add(safe(filing.getInterestIncome()))
                .add(safe(filing.getRentalIncome()))
                .subtract(safe(filing.getHomeLoanInterestOnLetOut()))
                .add(safe(filing.getDigitalAssetIncome()))
                .add(safe(filing.getShortTermCapitalGains()))
                .add(safe(filing.getLongTermCapitalGains()))
                .add(safe(filing.getBusinessIncome()))
                .add(safe(filing.getOtherIncome()));

        if (grossIncome.compareTo(BigDecimal.ZERO) < 0) {
            grossIncome = BigDecimal.ZERO;
        }
        filing.setGrossTotalIncome(grossIncome);

        // Old Regime deductions
        BigDecimal totalDed = BigDecimal.ZERO;
        totalDed = totalDed.add(safe(filing.getSection80C()).min(BigDecimal.valueOf(150000)));
        totalDed = totalDed.add(safe(filing.getSection80CCD1B()).min(BigDecimal.valueOf(50000)));
        totalDed = totalDed.add(safe(filing.getSection80D()));
        totalDed = totalDed.add(safe(filing.getSection80DHealthCheckup()).min(BigDecimal.valueOf(5000)));
        totalDed = totalDed.add(safe(filing.getSection80G()));
        totalDed = totalDed.add(safe(filing.getSection80E()));
        totalDed = totalDed.add(safe(filing.getSection80EEA()));
        totalDed = totalDed.add(safe(filing.getSection80TTA()).min(BigDecimal.valueOf(10000)));
        totalDed = totalDed.add(safe(filing.getSection24B()).min(BigDecimal.valueOf(200000)));
        totalDed = totalDed.add(safe(filing.getOtherDeductions()));
        filing.setTotalDeductions(totalDed);

        BigDecimal taxableOld = grossIncome.subtract(totalDed);
        if (taxableOld.compareTo(BigDecimal.ZERO) < 0) taxableOld = BigDecimal.ZERO;
        filing.setTaxableIncome(taxableOld);

        // Use existing TaxCalculatorService for slab calculations
        TaxCalculatorService.TaxDeductions deductions = new TaxCalculatorService.TaxDeductions();
        deductions.setSection80C(safe(filing.getSection80C()));
        deductions.setSection80D(safe(filing.getSection80D()));
        deductions.setSection24B(safe(filing.getSection24B()));
        deductions.setOtherDeductions(totalDed
                .subtract(safe(filing.getSection80C()).min(BigDecimal.valueOf(150000)))
                .subtract(safe(filing.getSection80D()))
                .subtract(safe(filing.getSection24B()).min(BigDecimal.valueOf(200000))));

        TaxCalculatorService.TaxCalculation oldCalc = taxCalculatorService.calculateOldRegimeTax(grossIncome, deductions);
        filing.setTaxOldRegime(oldCalc.getTax());
        filing.setCessOldRegime(oldCalc.getCess());
        filing.setTotalTaxOldRegime(oldCalc.getTotalTax());

        TaxCalculatorService.TaxCalculation newCalc = taxCalculatorService.calculateNewRegimeTax(grossIncome);
        filing.setTaxNewRegime(newCalc.getTax());
        filing.setCessNewRegime(newCalc.getCess());
        filing.setTotalTaxNewRegime(newCalc.getTotalTax());

        // Recommend regime
        if (oldCalc.getTotalTax().compareTo(newCalc.getTotalTax()) < 0) {
            filing.setRecommendedRegime("OLD");
            filing.setTaxSavings(newCalc.getTotalTax().subtract(oldCalc.getTotalTax()));
        } else {
            filing.setRecommendedRegime("NEW");
            filing.setTaxSavings(oldCalc.getTotalTax().subtract(newCalc.getTotalTax()));
        }

        // Calculate refund or payable
        String regime = filing.getSelectedRegime() != null ? filing.getSelectedRegime() : filing.getRecommendedRegime();
        BigDecimal totalTax = "OLD".equals(regime) ? filing.getTotalTaxOldRegime() : filing.getTotalTaxNewRegime();
        BigDecimal totalPaid = safe(filing.getTdsPaid())
                .add(safe(filing.getAdvanceTaxPaid()))
                .add(safe(filing.getSelfAssessmentTaxPaid()));
        filing.setRefundOrPayable(totalPaid.subtract(totalTax));
    }

    // Recommend ITR form type based on income sources (India specific)
    public String recommendITRForm(TaxFiling filing) {
        boolean hasCapitalGains = safe(filing.getShortTermCapitalGains()).compareTo(BigDecimal.ZERO) > 0
                || safe(filing.getLongTermCapitalGains()).compareTo(BigDecimal.ZERO) > 0;
        boolean hasBusinessIncome = safe(filing.getBusinessIncome()).compareTo(BigDecimal.ZERO) > 0;
        boolean hasMultipleHouseProperty = safe(filing.getRentalIncome()).compareTo(BigDecimal.ZERO) > 0
                && safe(filing.getHomeLoanInterestOnLetOut()).compareTo(BigDecimal.ZERO) > 0;

        if (hasBusinessIncome && !hasCapitalGains) {
            return "ITR-4"; // Presumptive business income
        }
        if (hasBusinessIncome && hasCapitalGains) {
            return "ITR-3"; // Business + capital gains
        }
        if (hasCapitalGains || hasMultipleHouseProperty) {
            return "ITR-2"; // Capital gains or multiple house property
        }
        return "ITR-1"; // Salary + one house property + other sources (Sahaj)
    }

    // Generate document checklist
    public List<Map<String, Object>> generateDocChecklist(TaxFiling filing) {
        List<Map<String, Object>> checklist = new ArrayList<>();

        checklist.add(docItem("PAN Card", "Identity proof", true));
        checklist.add(docItem("Aadhaar Card", "Mandatory for e-filing", true));
        checklist.add(docItem("Form 16", "TDS certificate from employer",
                safe(filing.getSalaryIncome()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("Form 16A", "TDS on non-salary income",
                safe(filing.getInterestIncome()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("Form 26AS / AIS", "Annual tax statement", true));
        checklist.add(docItem("Bank Statements", "Interest income and transactions", true));
        checklist.add(docItem("80C Proof", "PPF, ELSS, LIC premium receipts",
                safe(filing.getSection80C()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("80D Proof", "Health insurance premium receipts",
                safe(filing.getSection80D()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("Home Loan Certificate", "Interest and principal statement",
                safe(filing.getSection24B()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("Rent Receipts", "HRA exemption claim",
                safe(filing.getHraExemption()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("Capital Gains Statement", "Equity, mutual fund, property sales",
                safe(filing.getShortTermCapitalGains()).compareTo(BigDecimal.ZERO) > 0
                        || safe(filing.getLongTermCapitalGains()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("Donation Receipts (80G)", "Eligible donation receipts",
                safe(filing.getSection80G()).compareTo(BigDecimal.ZERO) > 0));
        checklist.add(docItem("NPS Contribution Proof", "Section 80CCD(1B) deduction",
                safe(filing.getSection80CCD1B()).compareTo(BigDecimal.ZERO) > 0));

        return checklist;
    }

    // Generate tax saving tips
    public List<String> generateTaxSavingTips(TaxFiling filing) {
        List<String> tips = new ArrayList<>();

        BigDecimal used80C = safe(filing.getSection80C());
        if (used80C.compareTo(BigDecimal.valueOf(150000)) < 0) {
            BigDecimal remaining = BigDecimal.valueOf(150000).subtract(used80C);
            tips.add("You can still invest ₹" + remaining.setScale(0, RoundingMode.HALF_UP)
                    + " more under Section 80C (PPF, ELSS, LIC) to save up to ₹"
                    + remaining.multiply(BigDecimal.valueOf(0.30)).setScale(0, RoundingMode.HALF_UP) + " in taxes.");
        }

        if (safe(filing.getSection80CCD1B()).compareTo(BigDecimal.valueOf(50000)) < 0) {
            tips.add("Invest in NPS under Section 80CCD(1B) for an additional ₹50,000 deduction beyond 80C limit.");
        }

        if (safe(filing.getSection80D()).compareTo(BigDecimal.ZERO) == 0) {
            tips.add("Consider health insurance: Get up to ₹25,000 deduction under Section 80D (₹50,000 for senior citizens).");
        }

        if (safe(filing.getSection80TTA()).compareTo(BigDecimal.ZERO) == 0
                && safe(filing.getInterestIncome()).compareTo(BigDecimal.ZERO) > 0) {
            tips.add("Claim savings account interest deduction up to ₹10,000 under Section 80TTA.");
        }

        if (filing.getRecommendedRegime() != null && filing.getSelectedRegime() != null
                && !filing.getSelectedRegime().equals(filing.getRecommendedRegime())) {
            tips.add("Switching to the " + filing.getRecommendedRegime()
                    + " Regime could save you ₹" + filing.getTaxSavings().setScale(0, RoundingMode.HALF_UP) + ".");
        }

        BigDecimal grossIncome = safe(filing.getGrossTotalIncome());
        if (grossIncome.compareTo(BigDecimal.valueOf(500000)) <= 0 && grossIncome.compareTo(BigDecimal.ZERO) > 0) {
            tips.add("Your income is under ₹5L — you may qualify for full tax rebate under Section 87A.");
        }

        if (tips.isEmpty()) {
            tips.add("Great job! You've maximized most available deductions. Consider consulting a CA for advanced tax planning.");
        }

        return tips;
    }

    // Filing summary
    public Map<String, Object> generateFilingSummary(String filingId) {
        TaxFiling filing = taxFilingRepository.findById(filingId)
                .orElseThrow(() -> new RuntimeException("Filing not found"));

        computeTax(filing);

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("personalInfo", Map.of(
                "name", filing.getFullName() != null ? filing.getFullName() : "",
                "pan", filing.getPanNumber() != null ? filing.getPanNumber() : "",
                "assessmentYear", filing.getAssessmentYear() != null ? filing.getAssessmentYear() : "",
                "financialYear", filing.getFinancialYear() != null ? filing.getFinancialYear() : "",
                "itrForm", filing.getItrFormType() != null ? filing.getItrFormType() : "",
                "status", filing.getStatus() != null ? filing.getStatus() : ""
        ));

        summary.put("incomeBreakdown", Map.of(
                "salaryIncome", safe(filing.getSalaryIncome()),
                "interestIncome", safe(filing.getInterestIncome()),
                "rentalIncome", safe(filing.getRentalIncome()),
                "capitalGains", safe(filing.getShortTermCapitalGains()).add(safe(filing.getLongTermCapitalGains())),
                "businessIncome", safe(filing.getBusinessIncome()),
                "otherIncome", safe(filing.getOtherIncome()),
                "grossTotalIncome", safe(filing.getGrossTotalIncome())
        ));

        summary.put("deductions", Map.of(
                "section80C", safe(filing.getSection80C()),
                "section80D", safe(filing.getSection80D()),
                "section24B", safe(filing.getSection24B()),
                "section80CCD1B", safe(filing.getSection80CCD1B()),
                "totalDeductions", safe(filing.getTotalDeductions())
        ));

        summary.put("taxComputation", Map.of(
                "oldRegime", Map.of(
                        "tax", safe(filing.getTaxOldRegime()),
                        "cess", safe(filing.getCessOldRegime()),
                        "total", safe(filing.getTotalTaxOldRegime())
                ),
                "newRegime", Map.of(
                        "tax", safe(filing.getTaxNewRegime()),
                        "cess", safe(filing.getCessNewRegime()),
                        "total", safe(filing.getTotalTaxNewRegime())
                ),
                "recommendedRegime", filing.getRecommendedRegime(),
                "taxSavings", safe(filing.getTaxSavings())
        ));

        summary.put("taxPayment", Map.of(
                "tdsPaid", safe(filing.getTdsPaid()),
                "advanceTaxPaid", safe(filing.getAdvanceTaxPaid()),
                "selfAssessmentTaxPaid", safe(filing.getSelfAssessmentTaxPaid()),
                "refundOrPayable", safe(filing.getRefundOrPayable())
        ));

        summary.put("documentChecklist", generateDocChecklist(filing));
        summary.put("taxSavingTips", generateTaxSavingTips(filing));

        return summary;
    }

    // Helper: null-safe BigDecimal
    private BigDecimal safe(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    // Helper: build checklist item
    private Map<String, Object> docItem(String name, String description, boolean required) {
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("name", name);
        item.put("description", description);
        item.put("required", required);
        return item;
    }

    // Map request DTO to model
    private void mapRequestToFiling(TaxFilingRequest req, TaxFiling filing) {
        if (req.getAssessmentYear() != null) filing.setAssessmentYear(req.getAssessmentYear());
        if (req.getFinancialYear() != null) filing.setFinancialYear(req.getFinancialYear());
        if (req.getPanNumber() != null) filing.setPanNumber(req.getPanNumber());
        if (req.getFullName() != null) filing.setFullName(req.getFullName());
        if (req.getSelectedRegime() != null) filing.setSelectedRegime(req.getSelectedRegime());

        if (req.getSalaryIncome() != null) filing.setSalaryIncome(req.getSalaryIncome());
        if (req.getHraExemption() != null) filing.setHraExemption(req.getHraExemption());
        if (req.getLtaExemption() != null) filing.setLtaExemption(req.getLtaExemption());
        if (req.getInterestIncome() != null) filing.setInterestIncome(req.getInterestIncome());
        if (req.getRentalIncome() != null) filing.setRentalIncome(req.getRentalIncome());
        if (req.getHomeLoanInterestOnLetOut() != null) filing.setHomeLoanInterestOnLetOut(req.getHomeLoanInterestOnLetOut());
        if (req.getDigitalAssetIncome() != null) filing.setDigitalAssetIncome(req.getDigitalAssetIncome());
        if (req.getShortTermCapitalGains() != null) filing.setShortTermCapitalGains(req.getShortTermCapitalGains());
        if (req.getLongTermCapitalGains() != null) filing.setLongTermCapitalGains(req.getLongTermCapitalGains());
        if (req.getBusinessIncome() != null) filing.setBusinessIncome(req.getBusinessIncome());
        if (req.getAgriculturalIncome() != null) filing.setAgriculturalIncome(req.getAgriculturalIncome());
        if (req.getOtherIncome() != null) filing.setOtherIncome(req.getOtherIncome());

        if (req.getSection80C() != null) filing.setSection80C(req.getSection80C());
        if (req.getSection80CCD1B() != null) filing.setSection80CCD1B(req.getSection80CCD1B());
        if (req.getSection80D() != null) filing.setSection80D(req.getSection80D());
        if (req.getSection80DHealthCheckup() != null) filing.setSection80DHealthCheckup(req.getSection80DHealthCheckup());
        if (req.getSection80G() != null) filing.setSection80G(req.getSection80G());
        if (req.getSection80E() != null) filing.setSection80E(req.getSection80E());
        if (req.getSection80EEA() != null) filing.setSection80EEA(req.getSection80EEA());
        if (req.getSection80TTA() != null) filing.setSection80TTA(req.getSection80TTA());
        if (req.getSection24B() != null) filing.setSection24B(req.getSection24B());
        if (req.getOtherDeductions() != null) filing.setOtherDeductions(req.getOtherDeductions());

        if (req.getTdsPaid() != null) filing.setTdsPaid(req.getTdsPaid());
        if (req.getAdvanceTaxPaid() != null) filing.setAdvanceTaxPaid(req.getAdvanceTaxPaid());
        if (req.getSelfAssessmentTaxPaid() != null) filing.setSelfAssessmentTaxPaid(req.getSelfAssessmentTaxPaid());
    }
}
