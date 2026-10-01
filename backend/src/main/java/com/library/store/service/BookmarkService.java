package com.library.store.service;

import com.library.store.entity.*;
import com.library.store.exception.*;
import com.library.store.repository.*;
import com.library.store.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final BookRepository bookRepository;
    private final UserLibraryRepository userLibraryRepository;
    private final SecurityUtils securityUtils;

    public List<Bookmark> getBookmarks(Long bookId) {
        User user = securityUtils.getCurrentUser();
        return bookmarkRepository.findByUserIdAndBookIdOrderByPageNumber(user.getId(), bookId);
    }

    @Transactional
    public Bookmark addBookmark(Long bookId, Integer pageNumber, String note) {
        User user = securityUtils.getCurrentUser();
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

        // Check if user has access
        if (book.getAccessType() == Book.AccessType.PAID &&
            !userLibraryRepository.existsByUserIdAndBookId(user.getId(), bookId)) {
            throw new AccessDeniedException("You don't have access to this book");
        }

        // Check if bookmark already exists on this page
        if (bookmarkRepository.findByUserIdAndBookIdAndPageNumber(user.getId(), bookId, pageNumber).isPresent()) {
            throw new DuplicateResourceException("Bookmark already exists on page " + pageNumber);
        }

        return bookmarkRepository.save(Bookmark.builder()
            .user(user).book(book).pageNumber(pageNumber).note(note).build());
    }

    @Transactional
    public void removeBookmark(Long bookmarkId) {
        User user = securityUtils.getCurrentUser();
        Bookmark bookmark = bookmarkRepository.findById(bookmarkId)
            .orElseThrow(() -> new ResourceNotFoundException("Bookmark", bookmarkId));
        if (!bookmark.getUser().getId().equals(user.getId())) {
            throw new AccessDeniedException("Not your bookmark");
        }
        bookmarkRepository.delete(bookmark);
    }
}
