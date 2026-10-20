package com.example.FinanceAssist.repository;

import com.example.FinanceAssist.model.TaxFiling;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface TaxFilingRepository extends MongoRepository<TaxFiling, String> {
    List<TaxFiling> findByUserIdOrderByCreatedAtDesc(String userId);
    Optional<TaxFiling> findByUserIdAndAssessmentYear(String userId, String assessmentYear);
    List<TaxFiling> findByUserId(String userId);
}
