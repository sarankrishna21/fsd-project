package com.library.store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class BookResponse {
    private Long id;
    private String title;
    private String author;
    private String description;
    private String isbn;
    private String publisher;
    private LocalDate publicationDate;
    private String language;
    private Integer pages;
    private String coverUrl;
    private String accessType;
    private BigDecimal price;
    private String status;
    private String tags;
    private Double averageRating;
    private Integer totalRatings;
    private Integer purchaseCount;
    private Long categoryId;
    private String categoryName;
    private LocalDateTime createdAt;
    private boolean inLibrary;
    private Double readingProgress;
}
