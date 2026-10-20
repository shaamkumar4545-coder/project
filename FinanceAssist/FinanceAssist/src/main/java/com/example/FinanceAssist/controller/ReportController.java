package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reports")
public class ReportController {
    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/year-wise-comparison")
    public ResponseEntity<List<ReportService.YearFinancialData>> getYearWiseComparison(
            @RequestParam String userId,
            @RequestParam int startYear,
            @RequestParam int endYear) {
        return ResponseEntity.ok(reportService.getYearWiseComparison(userId, startYear, endYear));
    }

    @GetMapping("/net-worth-growth")
    public ResponseEntity<List<ReportService.NetWorthData>> getNetWorthGrowth(
            @RequestParam String userId,
            @RequestParam int startYear,
            @RequestParam int endYear) {
        return ResponseEntity.ok(reportService.getNetWorthGrowth(userId, startYear, endYear));
    }

    @GetMapping("/tax-history")
    public ResponseEntity<List<ReportService.TaxHistoryData>> getTaxHistory(
            @RequestParam String userId,
            @RequestParam int startYear,
            @RequestParam int endYear) {
        return ResponseEntity.ok(reportService.getTaxHistory(userId, startYear, endYear));
    }

    @GetMapping("/comprehensive")
    public ResponseEntity<ReportService.FinancialReport> getComprehensiveReport(
            @RequestParam String userId,
            @RequestParam int year) {
        return ResponseEntity.ok(reportService.getComprehensiveReport(userId, year));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<Map<String, String>> exportPDF(
            @RequestParam String userId,
            @RequestParam int year) {
        // PDF export will be handled by frontend using jsPDF
        // This endpoint can return data in a format suitable for PDF generation
        ReportService.FinancialReport report = reportService.getComprehensiveReport(userId, year);
        return ResponseEntity.ok(Map.of("message", "Use frontend PDF export", "data", report.toString()));
    }

    @GetMapping("/export/excel")
    public ResponseEntity<Map<String, String>> exportExcel(
            @RequestParam String userId,
            @RequestParam int year) {
        // Excel export will be handled by frontend using xlsx
        // This endpoint can return data in a format suitable for Excel generation
        ReportService.FinancialReport report = reportService.getComprehensiveReport(userId, year);
        return ResponseEntity.ok(Map.of("message", "Use frontend Excel export", "data", report.toString()));
    }
}

