package com.example.FinanceAssist.service;

import com.example.FinanceAssist.model.Transaction;
import com.example.FinanceAssist.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class TransactionService {
    private final TransactionRepository transactionRepository;

    public TransactionService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<Transaction> findAll() { return transactionRepository.findAll(); }
    public Optional<Transaction> findById(String id) { return transactionRepository.findById(id); }
    public List<Transaction> findByUserId(String userId) { return transactionRepository.findByUserId(userId); }
    public List<Transaction> findByAccountId(String accountId) { return transactionRepository.findByAccountId(accountId); }
    public Transaction save(Transaction tx) { return transactionRepository.save(tx); }
    public void deleteById(String id) { transactionRepository.deleteById(id); }
}
