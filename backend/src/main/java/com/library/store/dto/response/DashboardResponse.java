package com.library.store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DashboardResponse {
    private long totalBooks;
    private long freeBooks;
    private long paidBooks;
    private long totalUsers;
    private long totalOrders;
    private BigDecimal totalRevenue;
    private long activeUsers;
}
