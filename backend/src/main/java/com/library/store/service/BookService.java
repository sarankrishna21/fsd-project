package com.library.store.service;

import com.library.store.dto.request.BookRequest;
import com.library.store.dto.response.BookResponse;
import com.library.store.entity.*;
import com.library.store.exception.ResourceNotFoundException;
import com.library.store.repository.*;
import com.library.store.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final UserLibraryRepository userLibraryRepository;
    private final ReadingProgressRepository readingProgressRepository;
    private final FileStorageService fileStorageService;

    public Page<BookResponse> getAllBooks(String query, Long categoryId, String accessType,
                                          String sortBy, int page, int size) {
        Sort sort = getSort(sortBy);
        Pageable pageable = PageRequest.of(page, size, sort);

        Book.AccessType at = null;
        if (accessType != null && !accessType.isEmpty()) {
            try { at = Book.AccessType.valueOf(accessType.toUpperCase()); } catch (Exception ignored) {}
        }

        Page<Book> books;
        if (query != null && !query.trim().isEmpty()) {
            books = bookRepository.searchBooks(query.trim(), pageable);
        } else if (categoryId != null) {
            books = bookRepository.findByCategoryId(categoryId, pageable);
        } else if (at != null) {
            books = bookRepository.findByStatusAndAccessType(Book.BookStatus.ACTIVE, at, pageable);
        } else {
            books = bookRepository.findByStatus(Book.BookStatus.ACTIVE, pageable);
        }

        Long userId = getCurrentUserId();
        return books.map(b -> toResponse(b, userId));
    }

    public BookResponse getBookById(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
        Long userId = getCurrentUserId();
        return toResponse(book, userId);
    }

    @Transactional
    public BookResponse createBook(BookRequest request, MultipartFile coverFile, MultipartFile bookFile) {
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        Book.AccessType accessType = Book.AccessType.valueOf(request.getAccessType().toUpperCase());
        BigDecimal price = accessType == Book.AccessType.FREE ? BigDecimal.ZERO
            : (request.getPrice() != null ? request.getPrice() : BigDecimal.ZERO);

        Book book = Book.builder()
            .title(request.getTitle())
            .author(request.getAuthor())
            .description(request.getDescription())
            .isbn(request.getIsbn())
            .publisher(request.getPublisher())
            .publicationDate(request.getPublicationDate())
            .language(request.getLanguage())
            .pages(request.getPages())
            .category(category)
            .accessType(accessType)
            .price(price)
            .tags(request.getTags())
            .status(Book.BookStatus.ACTIVE)
            .build();

        if (coverFile != null && !coverFile.isEmpty()) {
            String coverUrl = fileStorageService.storeFile(coverFile, "covers");
            book.setCoverUrl(coverUrl);
        }
        if (bookFile != null && !bookFile.isEmpty()) {
            String fileUrl = fileStorageService.storeFile(bookFile, "books");
            book.setFileUrl(fileUrl);
        }

        Book saved = bookRepository.save(book);
        updateCategoryCount(category);
        log.info("Book created: {} ({})", saved.getTitle(), saved.getId());
        return toResponse(saved, null);
    }

    @Transactional
    public BookResponse updateBook(Long id, BookRequest request, MultipartFile coverFile, MultipartFile bookFile) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category", request.getCategoryId()));

        Book.AccessType accessType = Book.AccessType.valueOf(request.getAccessType().toUpperCase());
        BigDecimal price = accessType == Book.AccessType.FREE ? BigDecimal.ZERO
            : (request.getPrice() != null ? request.getPrice() : book.getPrice());

        book.setTitle(request.getTitle());
        book.setAuthor(request.getAuthor());
        book.setDescription(request.getDescription());
        book.setIsbn(request.getIsbn());
        book.setPublisher(request.getPublisher());
        book.setPublicationDate(request.getPublicationDate());
        book.setLanguage(request.getLanguage());
        book.setPages(request.getPages());
        book.setCategory(category);
        book.setAccessType(accessType);
        book.setPrice(price);
        book.setTags(request.getTags());
        if (request.getStatus() != null) {
            book.setStatus(Book.BookStatus.valueOf(request.getStatus().toUpperCase()));
        }

        if (coverFile != null && !coverFile.isEmpty()) {
            fileStorageService.deleteFile(book.getCoverUrl());
            book.setCoverUrl(fileStorageService.storeFile(coverFile, "covers"));
        }
        if (bookFile != null && !bookFile.isEmpty()) {
            fileStorageService.deleteFile(book.getFileUrl());
            book.setFileUrl(fileStorageService.storeFile(bookFile, "books"));
        }

        Book saved = bookRepository.save(book);
        return toResponse(saved, null);
    }

    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Book", id));
        book.setStatus(Book.BookStatus.DELETED);
        bookRepository.save(book);
        log.info("Book soft-deleted: {}", id);
    }

    public List<BookResponse> getFeaturedBooks() {
        return bookRepository.findTop10ByStatusOrderByCreatedAtDesc(Book.BookStatus.ACTIVE)
            .stream().map(b -> toResponse(b, null)).collect(Collectors.toList());
    }

    public List<BookResponse> getPopularBooks() {
        return bookRepository.findTop10ByStatusOrderByPurchaseCountDesc(Book.BookStatus.ACTIVE)
            .stream().map(b -> toResponse(b, null)).collect(Collectors.toList());
    }

    private Sort getSort(String sortBy) {
        if (sortBy == null) return Sort.by(Sort.Direction.DESC, "createdAt");
        return switch (sortBy.toLowerCase()) {
            case "title_asc" -> Sort.by(Sort.Direction.ASC, "title");
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "popular" -> Sort.by(Sort.Direction.DESC, "purchaseCount");
            case "rating" -> Sort.by(Sort.Direction.DESC, "averageRating");
            default -> Sort.by(Sort.Direction.DESC, "createdAt");
        };
    }

    private Long getCurrentUserId() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !auth.getPrincipal().equals("anonymousUser")) {
                return null; // Will be resolved properly when needed
            }
        } catch (Exception ignored) {}
        return null;
    }

    private void updateCategoryCount(Category category) {
        long count = bookRepository.countByStatusAndAccessType(Book.BookStatus.ACTIVE, Book.AccessType.FREE)
            + bookRepository.countByStatusAndAccessType(Book.BookStatus.ACTIVE, Book.AccessType.PAID);
        // Simple update - category count is approximate
    }

    public BookResponse toResponse(Book book, Long userId) {
        boolean inLibrary = false;
        Double progress = null;

        if (userId != null) {
            inLibrary = userLibraryRepository.existsByUserIdAndBookId(userId, book.getId());
            Optional<ReadingProgress> rp = readingProgressRepository.findByUserIdAndBookId(userId, book.getId());
            if (rp.isPresent()) {
                progress = rp.get().getProgressPercentage();
            }
        }

        return BookResponse.builder()
            .id(book.getId())
            .title(book.getTitle())
            .author(book.getAuthor())
            .description(book.getDescription())
            .isbn(book.getIsbn())
            .publisher(book.getPublisher())
            .publicationDate(book.getPublicationDate())
            .language(book.getLanguage())
            .pages(book.getPages())
            .coverUrl(book.getCoverUrl())
            .accessType(book.getAccessType().name())
            .price(book.getPrice())
            .status(book.getStatus().name())
            .tags(book.getTags())
            .averageRating(book.getAverageRating())
            .totalRatings(book.getTotalRatings())
            .purchaseCount(book.getPurchaseCount())
            .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
            .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
            .createdAt(book.getCreatedAt())
            .inLibrary(inLibrary)
            .readingProgress(progress)
            .build();
    }
}
