package com.example.FinanceAssist.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.FinanceAssist.model.Budget;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends MongoRepository<Budget, String> {
    List<Budget> findByUserId(String userId);
    Optional<Budget> findByUserIdAndCategoryAndMonthAndYear(String userId, String category, Integer month, Integer year);
    List<Budget> findByUserIdAndMonthAndYear(String userId, Integer month, Integer year);
}
