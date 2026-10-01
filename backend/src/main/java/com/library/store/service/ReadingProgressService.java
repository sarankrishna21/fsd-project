package com.library.store.service;

import com.library.store.dto.request.ReadingProgressRequest;
import com.library.store.entity.*;
import com.library.store.exception.ResourceNotFoundException;
import com.library.store.repository.*;
import com.library.store.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReadingProgressService {

    private final ReadingProgressRepository progressRepository;
    private final BookRepository bookRepository;
    private final SecurityUtils securityUtils;

    public ReadingProgress getProgress(Long bookId) {
        User user = securityUtils.getCurrentUser();
        return progressRepository.findByUserIdAndBookId(user.getId(), bookId).orElse(null);
    }

    @Transactional
    public ReadingProgress updateProgress(Long bookId, ReadingProgressRequest request) {
        User user = securityUtils.getCurrentUser();
        Book book = bookRepository.findById(bookId)
            .orElseThrow(() -> new ResourceNotFoundException("Book", bookId));

        ReadingProgress progress = progressRepository
            .findByUserIdAndBookId(user.getId(), bookId)
            .orElse(ReadingProgress.builder().user(user).book(book).build());

        if (request.getCurrentPage() != null) progress.setCurrentPage(request.getCurrentPage());
        if (request.getTotalPages() != null) progress.setTotalPages(request.getTotalPages());
        if (request.getProgressPercentage() != null) progress.setProgressPercentage(request.getProgressPercentage());
        if (request.getCompleted() != null) progress.setCompleted(request.getCompleted());

        // Auto-calculate progress if pages are set
        if (progress.getTotalPages() != null && progress.getTotalPages() > 0 && progress.getCurrentPage() != null) {
            progress.setProgressPercentage(
                (double) progress.getCurrentPage() / progress.getTotalPages() * 100
            );
        }

        return progressRepository.save(progress);
    }
}
