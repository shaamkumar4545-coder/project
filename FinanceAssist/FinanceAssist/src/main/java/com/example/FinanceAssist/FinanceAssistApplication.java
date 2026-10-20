package com.example.FinanceAssist;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FinanceAssistApplication {

	public static void main(String[] args) {
		SpringApplication.run(FinanceAssistApplication.class, args);
	}

}
