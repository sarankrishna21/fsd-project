package com.library.store.dto.request;

import lombok.Data;

@Data
public class ReadingProgressRequest {
    private Integer currentPage;
    private Integer totalPages;
    private Double progressPercentage;
    private Boolean completed;
}
