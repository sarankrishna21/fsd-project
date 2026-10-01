package com.library.store.repository;

import com.library.store.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {
    List<Bookmark> findByUserIdAndBookIdOrderByPageNumber(Long userId, Long bookId);
    Optional<Bookmark> findByUserIdAndBookIdAndPageNumber(Long userId, Long bookId, Integer pageNumber);
    void deleteByUserIdAndBookIdAndPageNumber(Long userId, Long bookId, Integer pageNumber);
}
