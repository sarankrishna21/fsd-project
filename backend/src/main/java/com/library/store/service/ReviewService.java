package com.library.store.service;

import com.library.store.dto.request.ReviewRequest;
import com.library.store.entity.*;
import com.library.store.exception.*;
import com.library.store.repository.*;
import com.library.store.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserLibraryRepository userLibraryRepository;
    private final SecurityUtils securityUtils;

    public List<Review> getBookReviews(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    @Transactional
    public Review addReview(Long bookId, ReviewRequest request) {
        User user = securityUtils.getCurrentUser();
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

        if (!userLibraryRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            throw new AccessDeniedException("You must read this book before reviewing it");
        }
        if (reviewRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            throw new DuplicateResourceException("You have already reviewed this book");
        }

        Review review = Review.builder()
            .user(user).book(book)
            .rating(request.getRating())
            .comment(request.getComment())
            .build();
        Review saved = reviewRepository.save(review);

        // Update book average rating
        Double avgRating = reviewRepository.getAverageRatingByBookId(bookId);
        Long totalRatings = reviewRepository.countByBookId(bookId);
        book.setAverageRating(avgRating != null ? avgRating : 0.0);
        book.setTotalRatings(totalRatings != null ? totalRatings.intValue() : 0);
        bookRepository.save(book);

        return saved;
    }
}
