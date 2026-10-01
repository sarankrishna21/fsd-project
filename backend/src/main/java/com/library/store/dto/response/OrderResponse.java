package com.library.store.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrderResponse {
    private Long id;
    private String orderNumber;
    private Long userId;
    private String userName;
    private BigDecimal totalAmount;
    private String paymentStatus;
    private String orderStatus;
    private String paymentMethod;
    private List<OrderItemResponse> items;
    private LocalDateTime createdAt;

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class OrderItemResponse {
        private Long id;
        private Long bookId;
        private String bookTitle;
        private String coverUrl;
        private BigDecimal price;
    }
}
