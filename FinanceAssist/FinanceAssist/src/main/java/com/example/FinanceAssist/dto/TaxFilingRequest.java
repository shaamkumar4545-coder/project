package com.example.FinanceAssist.dto;

import java.math.BigDecimal;

public class TaxFilingRequest {
    private String assessmentYear;
    private String financialYear;
    private String panNumber;
    private String fullName;
    private String selectedRegime;

    // Income
    private BigDecimal salaryIncome;
    private BigDecimal hraExemption;
    private BigDecimal ltaExemption;
    private BigDecimal interestIncome;
    private BigDecimal rentalIncome;
    private BigDecimal homeLoanInterestOnLetOut;
    private BigDecimal digitalAssetIncome;
    private BigDecimal shortTermCapitalGains;
    private BigDecimal longTermCapitalGains;
    private BigDecimal businessIncome;
    private BigDecimal agriculturalIncome;
    private BigDecimal otherIncome;

    // Deductions
    private BigDecimal section80C;
    private BigDecimal section80CCD1B;
    private BigDecimal section80D;
    private BigDecimal section80DHealthCheckup;
    private BigDecimal section80G;
    private BigDecimal section80E;
    private BigDecimal section80EEA;
    private BigDecimal section80TTA;
    private BigDecimal section24B;
    private BigDecimal otherDeductions;

    // Taxes paid
    private BigDecimal tdsPaid;
    private BigDecimal advanceTaxPaid;
    private BigDecimal selfAssessmentTaxPaid;

    // Getters and Setters
    public String getAssessmentYear() { return assessmentYear; }
    public void setAssessmentYear(String assessmentYear) { this.assessmentYear = assessmentYear; }

    public String getFinancialYear() { return financialYear; }
    public void setFinancialYear(String financialYear) { this.financialYear = financialYear; }

    public String getPanNumber() { return panNumber; }
    public void setPanNumber(String panNumber) { this.panNumber = panNumber; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getSelectedRegime() { return selectedRegime; }
    public void setSelectedRegime(String selectedRegime) { this.selectedRegime = selectedRegime; }

    public BigDecimal getSalaryIncome() { return salaryIncome; }
    public void setSalaryIncome(BigDecimal salaryIncome) { this.salaryIncome = salaryIncome; }

    public BigDecimal getHraExemption() { return hraExemption; }
    public void setHraExemption(BigDecimal hraExemption) { this.hraExemption = hraExemption; }

    public BigDecimal getLtaExemption() { return ltaExemption; }
    public void setLtaExemption(BigDecimal ltaExemption) { this.ltaExemption = ltaExemption; }

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

    public BigDecimal getTdsPaid() { return tdsPaid; }
    public void setTdsPaid(BigDecimal tdsPaid) { this.tdsPaid = tdsPaid; }

    public BigDecimal getAdvanceTaxPaid() { return advanceTaxPaid; }
    public void setAdvanceTaxPaid(BigDecimal advanceTaxPaid) { this.advanceTaxPaid = advanceTaxPaid; }

    public BigDecimal getSelfAssessmentTaxPaid() { return selfAssessmentTaxPaid; }
    public void setSelfAssessmentTaxPaid(BigDecimal selfAssessmentTaxPaid) { this.selfAssessmentTaxPaid = selfAssessmentTaxPaid; }
}
