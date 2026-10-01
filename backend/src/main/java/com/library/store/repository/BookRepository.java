package com.library.store.repository;

import com.library.store.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    @Query("SELECT b FROM Book b WHERE b.status = 'ACTIVE' AND " +
           "(LOWER(b.title) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
           "LOWER(b.author) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
           "LOWER(b.isbn) LIKE LOWER(CONCAT('%',:query,'%')) OR " +
           "LOWER(b.tags) LIKE LOWER(CONCAT('%',:query,'%')))")
    Page<Book> searchBooks(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM Book b WHERE b.status = 'ACTIVE' AND b.category.id = :categoryId")
    Page<Book> findByCategoryId(@Param("categoryId") Long categoryId, Pageable pageable);

    Page<Book> findByStatusAndAccessType(Book.BookStatus status, Book.AccessType accessType, Pageable pageable);

    Page<Book> findByStatus(Book.BookStatus status, Pageable pageable);

    long countByStatus(Book.BookStatus status);
    long countByStatusAndAccessType(Book.BookStatus status, Book.AccessType accessType);

    List<Book> findTop10ByStatusOrderByCreatedAtDesc(Book.BookStatus status);
    List<Book> findTop10ByStatusOrderByPurchaseCountDesc(Book.BookStatus status);

    @Query("SELECT b FROM Book b WHERE b.status = 'ACTIVE' AND " +
           "(:query IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%',:query,'%')) OR LOWER(b.author) LIKE LOWER(CONCAT('%',:query,'%'))) AND " +
           "(:categoryId IS NULL OR b.category.id = :categoryId) AND " +
           "(:accessType IS NULL OR b.accessType = :accessType)")
    Page<Book> findWithFilters(
        @Param("query") String query,
        @Param("categoryId") Long categoryId,
        @Param("accessType") Book.AccessType accessType,
        Pageable pageable
    );
}
