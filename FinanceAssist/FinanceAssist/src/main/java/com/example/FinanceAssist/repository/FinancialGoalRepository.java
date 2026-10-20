package com.example.FinanceAssist.repository;

import com.example.FinanceAssist.model.FinancialGoal;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FinancialGoalRepository extends MongoRepository<FinancialGoal, String> {
    List<FinancialGoal> findByUserId(String userId);
}
