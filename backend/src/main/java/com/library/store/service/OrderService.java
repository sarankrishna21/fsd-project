package com.library.store.service;

import com.library.store.dto.response.OrderResponse;
import com.library.store.entity.*;
import com.library.store.exception.DuplicateResourceException;
import com.library.store.exception.ResourceNotFoundException;
import com.library.store.repository.*;
import com.library.store.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final BookRepository bookRepository;
    private final UserLibraryRepository userLibraryRepository;
    private final SecurityUtils securityUtils;
    private final PaymentService paymentService;

    @Transactional
    public OrderResponse createOrder(List<Long> bookIds) {
        User user = securityUtils.getCurrentUser();

        List<Book> books = bookIds.stream()
            .map(id -> bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book", id)))
            .collect(Collectors.toList());

        // Check for duplicates
        for (Book book : books) {
            if (book.getAccessType() == Book.AccessType.FREE) {
                throw new IllegalArgumentException("Book '" + book.getTitle() + "' is free — no purchase needed");
            }
            if (userLibraryRepository.existsByUserIdAndBookId(user.getId(), book.getId())) {
                throw new DuplicateResourceException("You already own '" + book.getTitle() + "'");
            }
        }

        BigDecimal total = books.stream()
            .map(Book::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        String orderNumber = "ORD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Order order = Order.builder()
            .orderNumber(orderNumber)
            .user(user)
            .totalAmount(total)
            .paymentStatus(Order.PaymentStatus.PENDING)
            .orderStatus(Order.OrderStatus.CREATED)
            .paymentMethod("DEMO")
            .build();

        List<OrderItem> items = books.stream().map(book -> OrderItem.builder()
            .order(order)
            .book(book)
            .price(book.getPrice())
            .build()).collect(Collectors.toList());

        order.getItems().addAll(items);
        Order saved = orderRepository.save(order);

        log.info("Order created: {} for user: {}", orderNumber, user.getId());
        return toResponse(saved);
    }

    @Transactional
    public OrderResponse confirmPayment(Long orderId, String paymentId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));

        User user = securityUtils.getCurrentUser();
        if (!order.getUser().getId().equals(user.getId())) {
            throw new com.library.store.exception.AccessDeniedException("Not your order");
        }

        // Verify payment (demo mode)
        boolean verified = paymentService.verifyPayment(paymentId, order.getOrderNumber(), null);
        if (!verified) {
            order.setPaymentStatus(Order.PaymentStatus.FAILED);
            orderRepository.save(order);
            throw new RuntimeException("Payment verification failed");
        }

        order.setPaymentStatus(Order.PaymentStatus.PAID);
        order.setOrderStatus(Order.OrderStatus.CONFIRMED);
        order.setPaymentId(paymentId);
        orderRepository.save(order);

        // Grant library access
        for (OrderItem item : order.getItems()) {
            if (!userLibraryRepository.existsByUserIdAndBookId(user.getId(), item.getBook().getId())) {
                UserLibrary entry = UserLibrary.builder()
                    .user(user)
                    .book(item.getBook())
                    .source(UserLibrary.LibrarySource.PURCHASED)
                    .build();
                userLibraryRepository.save(entry);

                // Update purchase count
                Book book = item.getBook();
                book.setPurchaseCount(book.getPurchaseCount() + 1);
                bookRepository.save(book);
            }
        }

        log.info("Order {} confirmed, books added to library for user {}", order.getOrderNumber(), user.getId());
        return toResponse(order);
    }

    public Page<OrderResponse> getUserOrders(int page, int size) {
        User user = securityUtils.getCurrentUser();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        return orderRepository.findByUserId(user.getId(), pageable).map(this::toResponse);
    }

    public OrderResponse getOrder(Long orderId) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new ResourceNotFoundException("Order", orderId));
        User user = securityUtils.getCurrentUser();
        if (!order.getUser().getId().equals(user.getId()) && user.getRole() != User.Role.ROLE_ADMIN) {
            throw new com.library.store.exception.AccessDeniedException("Not your order");
        }
        return toResponse(order);
    }

    private OrderResponse toResponse(Order order) {
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
            .paymentMethod(order.getPaymentMethod())
            .items(items)
            .createdAt(order.getCreatedAt())
            .build();
    }
}
