package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.model.FinancialGoal;
import com.example.FinanceAssist.service.GoalService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/goals")
@CrossOrigin(origins = "http://localhost:5173")
public class GoalController {
    private final GoalService goalService;

    public GoalController(GoalService goalService) {
        this.goalService = goalService;
    }

    @GetMapping("/user/{userId}")
    public List<FinancialGoal> getGoals(@PathVariable String userId) {
        return goalService.findByUserId(userId);
    }

    @PostMapping
    public FinancialGoal createGoal(@RequestBody FinancialGoal goal) {
        return goalService.save(goal);
    }

    @GetMapping("/{id}/projection")
    public ResponseEntity<?> simulateProjection(
            @PathVariable String id,
            @RequestParam(required = false) BigDecimal extraMonthly,
            @RequestParam(required = false) BigDecimal lumpSum) {
        try {
            return ResponseEntity.ok(goalService.getProjection(id, extraMonthly, lumpSum));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Projection Error: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable String id) {
        goalService.delete(id);
        return ResponseEntity.ok().build();
    }
}
