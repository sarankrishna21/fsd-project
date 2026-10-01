package com.library.store.service;

import com.library.store.dto.response.BookResponse;
import com.library.store.entity.*;
import com.library.store.exception.AccessDeniedException;
import com.library.store.exception.DuplicateResourceException;
import com.library.store.exception.ResourceNotFoundException;
import com.library.store.repository.*;
import com.library.store.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LibraryService {

    private final UserLibraryRepository userLibraryRepository;
    private final BookRepository bookRepository;
    private final OrderRepository orderRepository;
    private final ReadingProgressRepository readingProgressRepository;
    private final SecurityUtils securityUtils;
    private final BookService bookService;

    public List<BookResponse> getUserLibrary() {
        User user = securityUtils.getCurrentUser();
        return userLibraryRepository.findByUserId(user.getId())
            .stream()
            .map(ul -> bookService.toResponse(ul.getBook(), user.getId()))
            .collect(Collectors.toList());
    }

    @Transactional
    public BookResponse addToLibrary(Long bookId) {
        User user = securityUtils.getCurrentUser();
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

        if (userLibraryRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            throw new DuplicateResourceException("Book already in your library");
        }

        if (book.getAccessType() == Book.AccessType.PAID) {
            // Check if user has purchased this book
            orderRepository.findPaidOrderByUserAndBook(user.getId(), bookId)
                .orElseThrow(() -> new AccessDeniedException("You must purchase this book first"));
        }

        UserLibrary entry = UserLibrary.builder()
            .user(user)
            .book(book)
            .source(book.getAccessType() == Book.AccessType.FREE
                ? UserLibrary.LibrarySource.FREE
                : UserLibrary.LibrarySource.PURCHASED)
            .build();

        userLibraryRepository.save(entry);
        log.info("Book {} added to library for user {}", bookId, user.getId());
        return bookService.toResponse(book, user.getId());
    }

    public boolean hasAccess(Long userId, Long bookId) {
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

        if (book.getAccessType() == Book.AccessType.FREE) return true;
        return userLibraryRepository.existsByUserIdAndBookId(userId, bookId);
    }

    public String getBookFileUrl(Long bookId) {
        User user = securityUtils.getCurrentUser();
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

        // Admin can always access
        if (user.getRole() == User.Role.ROLE_ADMIN) {
            return book.getFileUrl();
        }

        if (book.getAccessType() == Book.AccessType.PAID) {
            if (!userLibraryRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
                throw new AccessDeniedException("You must purchase this book to access it");
            }
        }

        // For free books, auto-add to library
        if (book.getAccessType() == Book.AccessType.FREE &&
            !userLibraryRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            UserLibrary entry = UserLibrary.builder()
                .user(user).book(book).source(UserLibrary.LibrarySource.FREE).build();
            userLibraryRepository.save(entry);
        }

        return book.getFileUrl();
    }
}
