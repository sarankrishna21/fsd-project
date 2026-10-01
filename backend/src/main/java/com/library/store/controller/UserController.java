package com.library.store.controller;

import com.library.store.dto.response.ApiResponse;
import com.library.store.dto.response.UserResponse;
import com.library.store.entity.User;
import com.library.store.exception.ResourceNotFoundException;
import com.library.store.repository.UserRepository;
import com.library.store.security.SecurityUtils;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "Users", description = "User profile management")
public class UserController {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        User user = securityUtils.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success(toResponse(user)));
    }

    @PutMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(@RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        if (body.containsKey("name")) user.setName(body.get("name"));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Profile updated", toResponse(user)));
    }

    @PutMapping("/me/password")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> changePassword(@RequestBody Map<String, String> body) {
        User user = securityUtils.getCurrentUser();
        String currentPassword = body.get("currentPassword");
        String newPassword = body.get("newPassword");

        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }
        if (newPassword == null || newPassword.length() < 6) {
            throw new IllegalArgumentException("New password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully", null));
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
            .id(user.getId())
            .name(user.getName())
            .email(user.getEmail())
            .role(user.getRole().name())
            .status(user.getStatus().name())
            .createdAt(user.getCreatedAt())
            .build();
    }
}
