package com.library.store.controller;

import com.library.store.dto.response.ApiResponse;
import com.library.store.dto.response.BookResponse;
import com.library.store.service.LibraryService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/library")
@RequiredArgsConstructor
@Tag(name = "Library", description = "User's personal library management")
public class LibraryController {

    private final LibraryService libraryService;

    @GetMapping
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getMyLibrary() {
        return ResponseEntity.ok(ApiResponse.success(libraryService.getUserLibrary()));
    }

    @PostMapping("/{bookId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<BookResponse>> addToLibrary(@PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.success("Book added to library", libraryService.addToLibrary(bookId)));
    }

    @GetMapping("/{bookId}/access")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Map<String, String>>> getBookAccess(@PathVariable Long bookId) {
        String fileUrl = libraryService.getBookFileUrl(bookId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("fileUrl", fileUrl != null ? fileUrl : "")));
    }
}
