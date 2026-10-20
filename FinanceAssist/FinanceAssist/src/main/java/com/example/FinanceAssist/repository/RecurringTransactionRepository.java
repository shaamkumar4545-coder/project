package com.example.FinanceAssist.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.FinanceAssist.model.RecurringTransaction;

import java.util.List;

public interface RecurringTransactionRepository extends MongoRepository<RecurringTransaction, String> {
    List<RecurringTransaction> findByUserId(String userId);
    List<RecurringTransaction> findByUserIdAndIsActive(String userId, Boolean isActive);
}

