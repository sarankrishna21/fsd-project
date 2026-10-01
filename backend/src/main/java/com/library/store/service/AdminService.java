package com.library.store.service;

import com.library.store.dto.response.*;
import com.library.store.entity.*;
import com.library.store.exception.*;
import com.library.store.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;

    public DashboardResponse getDashboardStats() {
        long totalBooks = bookRepository.countByStatus(Book.BookStatus.ACTIVE);
        long freeBooks = bookRepository.countByStatusAndAccessType(Book.BookStatus.ACTIVE, Book.AccessType.FREE);
        long paidBooks = bookRepository.countByStatusAndAccessType(Book.BookStatus.ACTIVE, Book.AccessType.PAID);
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByStatus(User.UserStatus.ACTIVE);
        long totalOrders = orderRepository.countByPaymentStatus(Order.PaymentStatus.PAID);
        var totalRevenue = orderRepository.getTotalRevenue();

        return DashboardResponse.builder()
            .totalBooks(totalBooks)
            .freeBooks(freeBooks)
            .paidBooks(paidBooks)
            .totalUsers(totalUsers)
            .activeUsers(activeUsers)
            .totalOrders(totalOrders)
            .totalRevenue(totalRevenue)
            .build();
    }

    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return userRepository.findAll(pageable).map(this::toUserResponse);
    }

    @Transactional
    public UserResponse updateUserStatus(Long userId, String status) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));

        // Prevent disabling the last admin
        if (user.getRole() == User.Role.ROLE_ADMIN && status.equals("INACTIVE")) {
            long adminCount = userRepository.countByRole(User.Role.ROLE_ADMIN);
            if (adminCount <= 1) {
                throw new IllegalArgumentException("Cannot disable the only administrator");
            }
        }

        user.setStatus(User.UserStatus.valueOf(status.toUpperCase()));
        return toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUserRole(Long userId, String role) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
        user.setRole(User.Role.valueOf(role.toUpperCase()));
        return toUserResponse(userRepository.save(user));
    }

    public Page<OrderResponse> getAllOrders(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findAll(pageable).map(order -> {
            List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
                .map(item -> OrderResponse.OrderItemResponse.builder()
                    .id(item.getId())
                    .bookId(item.getBook().getId())
                    .bookTitle(item.getBook().getTitle())
                    .coverUrl(item.getBook().getCoverUrl())
                    .price(item.getPrice())
                    .build())
                .collect(Collectors.toList());

            return OrderResponse.builder()
                .id(order.getId())
                .orderNumber(order.getOrderNumber())
                .userId(order.getUser().getId())
                .userName(order.getUser().getName())
                .totalAmount(order.getTotalAmount())
                .paymentStatus(order.getPaymentStatus().name())
                .orderStatus(order.getOrderStatus().name())
                .items(items)
                .createdAt(order.getCreatedAt())
                .build();
        });
    }

    private UserResponse toUserResponse(User user) {
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
