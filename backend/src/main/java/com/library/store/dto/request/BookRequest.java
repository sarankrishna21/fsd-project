package com.library.store.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class BookRequest {
    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Author is required")
    private String author;

    private String description;

    private String isbn;

    private String publisher;

    private LocalDate publicationDate;

    private String language;

    private Integer pages;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @NotBlank(message = "Access type is required")
    private String accessType; // FREE or PAID

    @DecimalMin(value = "0.0", message = "Price cannot be negative")
    private BigDecimal price;

    private String tags;

    private String status;
}
