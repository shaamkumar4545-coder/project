package com.example.FinanceAssist.service;

import com.example.FinanceAssist.model.Investment;
import com.example.FinanceAssist.repository.InvestmentRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class InvestmentService {
    private final InvestmentRepository investmentRepository;

    public InvestmentService(InvestmentRepository investmentRepository) {
        this.investmentRepository = investmentRepository;
    }

    public List<Investment> findAll() {
        return investmentRepository.findAll();
    }

    public Optional<Investment> findById(String id) {
        return investmentRepository.findById(id);
    }

    public List<Investment> findByUserId(String userId) {
        return investmentRepository.findByUserId(userId);
    }

    public List<Investment> findByUserIdAndAssetType(String userId, String assetType) {
        return investmentRepository.findByUserIdAndAssetType(userId, assetType);
    }

    public Investment save(Investment investment) {
        investment.setUpdatedAt(Instant.now());
        // Calculate current value if quantity and current price are set
        if (investment.getQuantity() != null && investment.getCurrentPrice() != null) {
            investment.setCurrentValue(
                investment.getCurrentPrice().multiply(BigDecimal.valueOf(investment.getQuantity()))
            );
        }
        return investmentRepository.save(investment);
    }

    public void deleteById(String id) {
        investmentRepository.deleteById(id);
    }

    // Calculate profit/loss for an investment
    public BigDecimal calculateProfitLoss(Investment investment) {
        if (investment.getCurrentValue() == null || investment.getInvestedAmount() == null) {
            return BigDecimal.ZERO;
        }
        return investment.getCurrentValue().subtract(investment.getInvestedAmount());
    }

    // Calculate profit/loss percentage
    public double calculateProfitLossPercentage(Investment investment) {
        if (investment.getInvestedAmount() == null || 
            investment.getInvestedAmount().compareTo(BigDecimal.ZERO) == 0) {
            return 0.0;
        }
        BigDecimal profitLoss = calculateProfitLoss(investment);
        return profitLoss.divide(investment.getInvestedAmount(), 4, RoundingMode.HALF_UP)
            .multiply(BigDecimal.valueOf(100)).doubleValue();
    }

    // Get portfolio summary for a user
    public PortfolioSummary getPortfolioSummary(String userId) {
        List<Investment> investments = findByUserId(userId);
        
        BigDecimal totalInvested = investments.stream()
            .map(Investment::getInvestedAmount)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalCurrentValue = investments.stream()
            .map(inv -> inv.getCurrentValue() != null ? inv.getCurrentValue() : inv.getInvestedAmount())
            .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal totalProfitLoss = totalCurrentValue.subtract(totalInvested);
        
        double profitLossPercentage = totalInvested.compareTo(BigDecimal.ZERO) > 0
            ? totalProfitLoss.divide(totalInvested, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100)).doubleValue()
            : 0.0;
        
        return new PortfolioSummary(totalInvested, totalCurrentValue, totalProfitLoss, profitLossPercentage);
    }

    public static class PortfolioSummary {
        private BigDecimal totalInvested;
        private BigDecimal totalCurrentValue;
        private BigDecimal totalProfitLoss;
        private double profitLossPercentage;

        public PortfolioSummary(BigDecimal totalInvested, BigDecimal totalCurrentValue, 
                               BigDecimal totalProfitLoss, double profitLossPercentage) {
            this.totalInvested = totalInvested;
            this.totalCurrentValue = totalCurrentValue;
            this.totalProfitLoss = totalProfitLoss;
            this.profitLossPercentage = profitLossPercentage;
        }

        public BigDecimal getTotalInvested() { return totalInvested; }
        public BigDecimal getTotalCurrentValue() { return totalCurrentValue; }
        public BigDecimal getTotalProfitLoss() { return totalProfitLoss; }
        public double getProfitLossPercentage() { return profitLossPercentage; }
    }

    public List<Map<String, Object>> fetchLiveStockPrices() {
        // Mock implementation with more realistic stock data
        List<Map<String, Object>> stocks = new ArrayList<>();
        
        stocks.add(createStock("Apple Inc.", "AAPL", 185.92, 1.25));
        stocks.add(createStock("Microsoft Corp.", "MSFT", 415.50, -0.45));
        stocks.add(createStock("NVIDIA Corp.", "NVDA", 894.33, 3.12));
        stocks.add(createStock("Amazon.com Inc.", "AMZN", 178.15, 0.88));
        stocks.add(createStock("Meta Platforms Inc.", "META", 484.03, -1.20));
        stocks.add(createStock("Alphabet Inc. Cl A", "GOOGL", 151.77, 0.55));
        stocks.add(createStock("Tesla Inc.", "TSLA", 175.79, -2.15));
        stocks.add(createStock("Berkshire Hathaway", "BRK-B", 408.33, 0.32));
        stocks.add(createStock("Broadcom Inc.", "AVGO", 1324.50, 1.54));
        stocks.add(createStock("Eli Lilly & Co", "LLY", 764.12, 0.76));
        
        return stocks;
    }

    private Map<String, Object> createStock(String name, String symbol, double price, double change) {
        Map<String, Object> stock = new HashMap<>();
        stock.put("name", name);
        stock.put("symbol", symbol);
        stock.put("price", BigDecimal.valueOf(price));
        stock.put("change", change);
        return stock;
    }

    public Map<String, Object> buyStock(String userId, String stockSymbol, int quantity) {
        // In a real app, you would fetch the current price from an API
        // Here we simulate it by finding the stock in our mock list
        List<Map<String, Object>> livePrices = fetchLiveStockPrices();
        Map<String, Object> stockData = livePrices.stream()
            .filter(s -> s.get("symbol").equals(stockSymbol))
            .findFirst()
            .orElseThrow(() -> new RuntimeException("Stock not found: " + stockSymbol));

        BigDecimal currentPrice = (BigDecimal) stockData.get("price");
        String stockName = (String) stockData.get("name");
        
        BigDecimal totalInvestment = currentPrice.multiply(BigDecimal.valueOf(quantity));

        Investment investment = new Investment();
        investment.setUserId(userId);
        investment.setAssetType("stock");
        investment.setAssetName(stockName + " (" + stockSymbol + ")");
        investment.setInvestedAmount(totalInvestment);
        investment.setCurrentValue(totalInvestment); // Initial current value is the same as invested
        investment.setQuantity(quantity);
        investment.setAveragePrice(currentPrice);
        investment.setCurrentPrice(currentPrice);
        investment.setPurchaseDate(Instant.now());
        investment.setNotes("Purchased via Live Market");

        Investment saved = save(investment);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "success");
        result.put("investment", saved);
        result.put("message", "Successfully purchased " + quantity + " shares of " + stockName);
        return result;
    }
}

