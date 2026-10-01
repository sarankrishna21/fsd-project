package com.library.store.controller;

import com.library.store.dto.response.ApiResponse;
import com.library.store.dto.response.OrderResponse;
import com.library.store.service.OrderService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orders")
@RequiredArgsConstructor
@Tag(name = "Orders", description = "Order and payment management")
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@RequestBody Map<String, List<Long>> body) {
        OrderResponse order = orderService.createOrder(body.get("bookIds"));
        return ResponseEntity.ok(ApiResponse.success("Order created successfully", order));
    }

    @PostMapping("/{orderId}/confirm-payment")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<OrderResponse>> confirmPayment(
        @PathVariable Long orderId,
        @RequestBody Map<String, String> body
    ) {
        String paymentId = body.getOrDefault("paymentId", "demo_" + orderId);
        OrderResponse order = orderService.confirmPayment(orderId, paymentId);
        return ResponseEntity.ok(ApiResponse.success("Payment confirmed successfully", order));
    }

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getMyOrders(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getUserOrders(page, size)));
    }

    @GetMapping("/{orderId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(ApiResponse.success(orderService.getOrder(orderId)));
    }
}
