package com.library.store.repository;

import com.library.store.entity.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, Long> {
    Page<Order> findByUserId(Long userId, Pageable pageable);
    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);
    Optional<Order> findByOrderNumber(String orderNumber);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM Order o WHERE o.paymentStatus = 'PAID'")
    BigDecimal getTotalRevenue();

    long countByPaymentStatus(Order.PaymentStatus status);

    @Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.paymentStatus = 'PAID' AND " +
           "EXISTS (SELECT oi FROM OrderItem oi WHERE oi.order = o AND oi.book.id = :bookId)")
    Optional<Order> findPaidOrderByUserAndBook(@Param("userId") Long userId, @Param("bookId") Long bookId);
}
