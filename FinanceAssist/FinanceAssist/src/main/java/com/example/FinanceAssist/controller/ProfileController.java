package com.example.FinanceAssist.controller;

import com.example.FinanceAssist.dto.AuthResponse;
import com.example.FinanceAssist.dto.UpdateProfileRequest;
import com.example.FinanceAssist.dto.UserDTO;
import com.example.FinanceAssist.model.User;
import com.example.FinanceAssist.repository.UserRepository;
import com.example.FinanceAssist.util.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public ProfileController(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // Get current user profile
    @GetMapping
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            UserDTO userDTO = new UserDTO(user.getId(), user.getName(), user.getEmail());
            return ResponseEntity.ok(userDTO);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch profile");
            return ResponseEntity.status(401).body(error);
        }
    }

    // Update user profile
    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request, Authentication authentication) {
        try {
            if (authentication == null) {
                return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
            }

            String email = authentication.getName();
            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if email is being changed and if new email already exists
            if (!user.getEmail().equals(request.getEmail())) {
                if (userRepository.findByEmail(request.getEmail()).isPresent()) {
                    return ResponseEntity.status(400).body(Map.of("error", "Email already exists"));
                }
            }

            // Update name and email
            user.setName(request.getName());
            user.setEmail(request.getEmail());

            // Update password if provided
            if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
                if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
                    return ResponseEntity.status(400).body(Map.of("error", "Current password is required to change password"));
                }

                // Verify current password
                if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                    return ResponseEntity.status(400).body(Map.of("error", "Current password is incorrect"));
                }

                // Validate new password
                if (request.getNewPassword().length() < 6) {
                    return ResponseEntity.status(400).body(Map.of("error", "New password must be at least 6 characters long"));
                }

                // Update password
                user.setPassword(passwordEncoder.encode(request.getNewPassword()));
            }

            // Save updated user
            User updatedUser = userRepository.save(user);

            // Generate new token if email changed
            String newToken = jwtUtil.generateToken(updatedUser.getEmail(), updatedUser.getId());

            UserDTO userDTO = new UserDTO(updatedUser.getId(), updatedUser.getName(), updatedUser.getEmail());

            Map<String, Object> response = new HashMap<>();
            response.put("user", userDTO);
            response.put("token", newToken);
            response.put("message", "Profile updated successfully");

            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(400).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to update profile");
            return ResponseEntity.status(500).body(error);
        }
    }
}

