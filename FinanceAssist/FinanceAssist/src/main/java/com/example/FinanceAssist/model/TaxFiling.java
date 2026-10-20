package com.example.FinanceAssist.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.math.BigDecimal;
import java.time.Instant;

@Document(collection = "tax_filings")
public class TaxFiling {
    @Id
    private String id;
    private String userId;

    private String assessmentYear;   // e.g. "2025-26"
    private String financialYear;    // e.g. "2024-25"
    private String panNumber;
    private String fullName;
    private String status;           // DRAFT, SUBMITTED, VERIFIED
    private String selectedRegime;   // OLD, NEW
    private String itrFormType;      // ITR-1, ITR-2, ITR-3, ITR-4

    // Income fields
    private BigDecimal salaryIncome = BigDecimal.ZERO;
    private BigDecimal hraExemption = BigDecimal.ZERO;
    private BigDecimal ltaExemption = BigDecimal.ZERO;
    private BigDecimal standardDeduction = BigDecimal.valueOf(50000); // Standard deduction
    private BigDecimal interestIncome = BigDecimal.ZERO;
    private BigDecimal rentalIncome = BigDecimal.ZERO;
    private BigDecimal homeLoanInterestOnLetOut = BigDecimal.ZERO;
    private BigDecimal digitalAssetIncome = BigDecimal.ZERO;
    private BigDecimal shortTermCapitalGains = BigDecimal.ZERO;
    private BigDecimal longTermCapitalGains = BigDecimal.ZERO;
    private BigDecimal businessIncome = BigDecimal.ZERO;
    private BigDecimal agriculturalIncome = BigDecimal.ZERO;
    private BigDecimal otherIncome = BigDecimal.ZERO;

    // Deductions
    private BigDecimal section80C = BigDecimal.ZERO;       // PPF, ELSS, LIC, etc. Max 1.5L
    private BigDecimal section80CCD1B = BigDecimal.ZERO;   // NPS additional. Max 50K
    private BigDecimal section80D = BigDecimal.ZERO;        // Health insurance
    private BigDecimal section80DHealthCheckup = BigDecimal.ZERO; // Max 5K
    private BigDecimal section80G = BigDecimal.ZERO;        // Donations
    private BigDecimal section80E = BigDecimal.ZERO;        // Education loan interest
    private BigDecimal section80EEA = BigDecimal.ZERO;      // Home loan interest (first-time)
    private BigDecimal section80TTA = BigDecimal.ZERO;      // Savings account interest. Max 10K
    private BigDecimal section24B = BigDecimal.ZERO;        // Home loan interest. Max 2L
    private BigDecimal otherDeductions = BigDecimal.ZERO;

    // Computed tax results (cached after computation)
    private BigDecimal grossTotalIncome = BigDecimal.ZERO;
    private BigDecimal totalDeductions = BigDecimal.ZERO;
    private BigDecimal taxableIncome = BigDecimal.ZERO;
    private BigDecimal taxOldRegime = BigDecimal.ZERO;
    private BigDecimal cessOldRegime = BigDecimal.ZERO;
    private BigDecimal totalTaxOldRegime = BigDecimal.ZERO;
    private BigDecimal taxNewRegime = BigDecimal.ZERO;
    private BigDecimal cessNewRegime = BigDecimal.ZERO;
    private BigDecimal totalTaxNewRegime = BigDecimal.ZERO;
    private BigDecimal taxSavings = BigDecimal.ZERO;
    private String recommendedRegime;

    // TDS already paid
    private BigDecimal tdsPaid = BigDecimal.ZERO;
    private BigDecimal advanceTaxPaid = BigDecimal.ZERO;
    private BigDecimal selfAssessmentTaxPaid = BigDecimal.ZERO;

    // Refund / Payable
    private BigDecimal refundOrPayable = BigDecimal.ZERO;

    private Instant filingDate;
    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getAssessmentYear() { return assessmentYear; }
    public void setAssessmentYear(String assessmentYear) { this.assessmentYear = assessmentYear; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getSelectedRegime() { return selectedRegime; }
    public void setSelectedRegime(String selectedRegime) { this.selectedRegime = selectedRegime; }

    public String getItrFormType() { return itrFormType; }
    public void setItrFormType(String itrFormType) { this.itrFormType = itrFormType; }

    public BigDecimal getSalaryIncome() { return salaryIncome; }
    public void setSalaryIncome(BigDecimal salaryIncome) { this.salaryIncome = salaryIncome; }

    public BigDecimal getHraExemption() { return hraExemption; }
    public void setHraExemption(BigDecimal hraExemption) { this.hraExemption = hraExemption; }

    public BigDecimal getLtaExemption() { return ltaExemption; }
    public void setLtaExemption(BigDecimal ltaExemption) { this.ltaExemption = ltaExemption; }

    public BigDecimal getStandardDeduction() { return standardDeduction; }
    public void setStandardDeduction(BigDecimal standardDeduction) { this.standardDeduction = standardDeduction; }

    public BigDecimal getInterestIncome() { return interestIncome; }
    public void setInterestIncome(BigDecimal interestIncome) { this.interestIncome = interestIncome; }

    public BigDecimal getRentalIncome() { return rentalIncome; }
    public void setRentalIncome(BigDecimal rentalIncome) { this.rentalIncome = rentalIncome; }

    public BigDecimal getHomeLoanInterestOnLetOut() { return homeLoanInterestOnLetOut; }
    public void setHomeLoanInterestOnLetOut(BigDecimal homeLoanInterestOnLetOut) { this.homeLoanInterestOnLetOut = homeLoanInterestOnLetOut; }

    public BigDecimal getDigitalAssetIncome() { return digitalAssetIncome; }
    public void setDigitalAssetIncome(BigDecimal digitalAssetIncome) { this.digitalAssetIncome = digitalAssetIncome; }

    public BigDecimal getShortTermCapitalGains() { return shortTermCapitalGains; }
    public void setShortTermCapitalGains(BigDecimal shortTermCapitalGains) { this.shortTermCapitalGains = shortTermCapitalGains; }

    public BigDecimal getLongTermCapitalGains() { return longTermCapitalGains; }
    public void setLongTermCapitalGains(BigDecimal longTermCapitalGains) { this.longTermCapitalGains = longTermCapitalGains; }

    public BigDecimal getBusinessIncome() { return businessIncome; }
    public void setBusinessIncome(BigDecimal businessIncome) { this.businessIncome = businessIncome; }

    public BigDecimal getAgriculturalIncome() { return agriculturalIncome; }
    public void setAgriculturalIncome(BigDecimal agriculturalIncome) { this.agriculturalIncome = agriculturalIncome; }

    public BigDecimal getOtherIncome() { return otherIncome; }
    public void setOtherIncome(BigDecimal otherIncome) { this.otherIncome = otherIncome; }

    public BigDecimal getSection80C() { return section80C; }
    public void setSection80C(BigDecimal section80C) { this.section80C = section80C; }

    public BigDecimal getSection80CCD1B() { return section80CCD1B; }
    public void setSection80CCD1B(BigDecimal section80CCD1B) { this.section80CCD1B = section80CCD1B; }

    public BigDecimal getSection80D() { return section80D; }
    public void setSection80D(BigDecimal section80D) { this.section80D = section80D; }

    public BigDecimal getSection80DHealthCheckup() { return section80DHealthCheckup; }
    public void setSection80DHealthCheckup(BigDecimal section80DHealthCheckup) { this.section80DHealthCheckup = section80DHealthCheckup; }

    public BigDecimal getSection80G() { return section80G; }
    public void setSection80G(BigDecimal section80G) { this.section80G = section80G; }

    public BigDecimal getSection80E() { return section80E; }
    public void setSection80E(BigDecimal section80E) { this.section80E = section80E; }

    public BigDecimal getSection80EEA() { return section80EEA; }
    public void setSection80EEA(BigDecimal section80EEA) { this.section80EEA = section80EEA; }

    public BigDecimal getSection80TTA() { return section80TTA; }
    public void setSection80TTA(BigDecimal section80TTA) { this.section80TTA = section80TTA; }

    public BigDecimal getSection24B() { return section24B; }
    public void setSection24B(BigDecimal section24B) { this.section24B = section24B; }

    public BigDecimal getOtherDeductions() { return otherDeductions; }
    public void setOtherDeductions(BigDecimal otherDeductions) { this.otherDeductions = otherDeductions; }

    public BigDecimal getGrossTotalIncome() { return grossTotalIncome; }
    public void setGrossTotalIncome(BigDecimal grossTotalIncome) { this.grossTotalIncome = grossTotalIncome; }

    public BigDecimal getTotalDeductions() { return totalDeductions; }
    public void setTotalDeductions(BigDecimal totalDeductions) { this.totalDeductions = totalDeductions; }

    public BigDecimal getTaxableIncome() { return taxableIncome; }
    public void setTaxableIncome(BigDecimal taxableIncome) { this.taxableIncome = taxableIncome; }

    public BigDecimal getTaxOldRegime() { return taxOldRegime; }
    public void setTaxOldRegime(BigDecimal taxOldRegime) { this.taxOldRegime = taxOldRegime; }

    public BigDecimal getCessOldRegime() { return cessOldRegime; }
    public void setCessOldRegime(BigDecimal cessOldRegime) { this.cessOldRegime = cessOldRegime; }

    public BigDecimal getTotalTaxOldRegime() { return totalTaxOldRegime; }
    public void setTotalTaxOldRegime(BigDecimal totalTaxOldRegime) { this.totalTaxOldRegime = totalTaxOldRegime; }

    public BigDecimal getTaxNewRegime() { return taxNewRegime; }
    public void setTaxNewRegime(BigDecimal taxNewRegime) { this.taxNewRegime = taxNewRegime; }

    public BigDecimal getCessNewRegime() { return cessNewRegime; }
    public void setCessNewRegime(BigDecimal cessNewRegime) { this.cessNewRegime = cessNewRegime; }

    public BigDecimal getTotalTaxNewRegime() { return totalTaxNewRegime; }
    public void setTotalTaxNewRegime(BigDecimal totalTaxNewRegime) { this.totalTaxNewRegime = totalTaxNewRegime; }

    public BigDecimal getTaxSavings() { return taxSavings; }
    public void setTaxSavings(BigDecimal taxSavings) { this.taxSavings = taxSavings; }

    public String getRecommendedRegime() { return recommendedRegime; }
    public void setRecommendedRegime(String recommendedRegime) { this.recommendedRegime = recommendedRegime; }

    public BigDecimal getTdsPaid() { return tdsPaid; }
    public void setTdsPaid(BigDecimal tdsPaid) { this.tdsPaid = tdsPaid; }

    public BigDecimal getAdvanceTaxPaid() { return advanceTaxPaid; }
    public void setAdvanceTaxPaid(BigDecimal advanceTaxPaid) { this.advanceTaxPaid = advanceTaxPaid; }

    public BigDecimal getSelfAssessmentTaxPaid() { return selfAssessmentTaxPaid; }
    public void setSelfAssessmentTaxPaid(BigDecimal selfAssessmentTaxPaid) { this.selfAssessmentTaxPaid = selfAssessmentTaxPaid; }

    public BigDecimal getRefundOrPayable() { return refundOrPayable; }
    public void setRefundOrPayable(BigDecimal refundOrPayable) { this.refundOrPayable = refundOrPayable; }

    public Instant getFilingDate() { return filingDate; }
    public void setFilingDate(Instant filingDate) { this.filingDate = filingDate; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
