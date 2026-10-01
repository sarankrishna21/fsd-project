package com.library.store.controller;

import com.library.store.dto.request.ReviewRequest;
import com.library.store.dto.response.ApiResponse;
import com.library.store.entity.Review;
import com.library.store.service.ReviewService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Reviews", description = "Book reviews and ratings")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/book/{bookId}")
    public ResponseEntity<ApiResponse<List<Review>>> getBookReviews(@PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.success(reviewService.getBookReviews(bookId)));
    }

    @PostMapping("/book/{bookId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Review>> addReview(
        @PathVariable Long bookId,
        @Valid @RequestBody ReviewRequest request
    ) {
        Review review = reviewService.addReview(bookId, request);
        return ResponseEntity.ok(ApiResponse.success("Review added successfully", review));
    }
}
