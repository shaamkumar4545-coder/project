package com.example.FinanceAssist.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.FinanceAssist.model.Investment;

import java.util.List;

public interface InvestmentRepository extends MongoRepository<Investment, String> {
    List<Investment> findByUserId(String userId);
    List<Investment> findByUserIdAndAssetType(String userId, String assetType);
}

