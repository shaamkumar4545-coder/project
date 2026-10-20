package com.example.FinanceAssist.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.FinanceAssist.model.Transaction;

import java.time.Instant;
import java.util.List;

public interface TransactionRepository extends MongoRepository<Transaction, String> {
    List<Transaction> findByUserId(String userId);
    List<Transaction> findByAccountId(String accountId);
    List<Transaction> findByUserIdAndDateBetween(String userId, Instant start, Instant end);
    List<Transaction> findByUserIdAndType(String userId, String type);
    List<Transaction> findByUserIdAndCategory(String userId, String category);
    List<Transaction> findTop10ByUserIdOrderByDateDesc(String userId);
}
