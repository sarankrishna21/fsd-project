package com.library.store.controller;

import com.library.store.dto.request.ReadingProgressRequest;
import com.library.store.dto.response.ApiResponse;
import com.library.store.entity.ReadingProgress;
import com.library.store.service.ReadingProgressService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/reading-progress")
@RequiredArgsConstructor
@Tag(name = "Reading Progress", description = "Track reading progress per book")
public class ReadingProgressController {

    private final ReadingProgressService progressService;

    @GetMapping("/{bookId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ReadingProgress>> getProgress(@PathVariable Long bookId) {
        ReadingProgress progress = progressService.getProgress(bookId);
        return ResponseEntity.ok(ApiResponse.success(progress));
    }

    @PutMapping("/{bookId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<ReadingProgress>> updateProgress(
        @PathVariable Long bookId,
        @RequestBody ReadingProgressRequest request
    ) {
        ReadingProgress progress = progressService.updateProgress(bookId, request);
        return ResponseEntity.ok(ApiResponse.success("Progress saved", progress));
    }
}
