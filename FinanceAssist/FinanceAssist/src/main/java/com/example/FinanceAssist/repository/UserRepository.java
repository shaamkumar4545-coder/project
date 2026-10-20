package com.example.FinanceAssist.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.FinanceAssist.model.User;

import java.util.Optional;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByEmail(String email);
}
