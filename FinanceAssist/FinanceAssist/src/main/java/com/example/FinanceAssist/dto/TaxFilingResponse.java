package com.example.FinanceAssist.dto;

import com.example.FinanceAssist.model.TaxFiling;

import java.util.List;
import java.util.Map;

public class TaxFilingResponse {
    private TaxFiling filing;
    private List<Map<String, Object>> documentChecklist;
    private List<String> taxSavingTips;
    private String message;

    public TaxFilingResponse() {}

    public TaxFilingResponse(TaxFiling filing, String message) {
        this.filing = filing;
        this.message = message;
    }

    public TaxFiling getFiling() { return filing; }
    public void setFiling(TaxFiling filing) { this.filing = filing; }

    public List<Map<String, Object>> getDocumentChecklist() { return documentChecklist; }
    public void setDocumentChecklist(List<Map<String, Object>> documentChecklist) { this.documentChecklist = documentChecklist; }

    public List<String> getTaxSavingTips() { return taxSavingTips; }
    public void setTaxSavingTips(List<String> taxSavingTips) { this.taxSavingTips = taxSavingTips; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
