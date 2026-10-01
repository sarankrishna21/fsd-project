package com.library.store.controller;

import com.library.store.dto.request.BookRequest;
import com.library.store.dto.response.ApiResponse;
import com.library.store.dto.response.BookResponse;
import com.library.store.service.BookService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/books")
@RequiredArgsConstructor
@Tag(name = "Books", description = "Book catalog and management")
public class BookController {

    private final BookService bookService;

    @GetMapping
    @Operation(summary = "Get all books with filters")
    public ResponseEntity<ApiResponse<Page<BookResponse>>> getBooks(
        @RequestParam(required = false) String query,
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) String accessType,
        @RequestParam(defaultValue = "newest") String sortBy,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size
    ) {
        Page<BookResponse> books = bookService.getAllBooks(query, categoryId, accessType, sortBy, page, size);
        return ResponseEntity.ok(ApiResponse.success(books));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get book by ID")
    public ResponseEntity<ApiResponse<BookResponse>> getBook(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(bookService.getBookById(id)));
    }

    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getFeatured() {
        return ResponseEntity.ok(ApiResponse.success(bookService.getFeaturedBooks()));
    }

    @GetMapping("/popular")
    public ResponseEntity<ApiResponse<List<BookResponse>>> getPopular() {
        return ResponseEntity.ok(ApiResponse.success(bookService.getPopularBooks()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add a new book", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<BookResponse>> createBook(
        @RequestPart("book") String bookJson,
        @RequestPart(value = "cover", required = false) MultipartFile cover,
        @RequestPart(value = "file", required = false) MultipartFile bookFile
    ) throws Exception {
        BookRequest request = new com.fasterxml.jackson.databind.ObjectMapper()
            .findAndRegisterModules()
            .readValue(bookJson, BookRequest.class);
        BookResponse book = bookService.createBook(request, cover, bookFile);
        return ResponseEntity.ok(ApiResponse.success("Book created successfully", book));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update a book", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<BookResponse>> updateBook(
        @PathVariable Long id,
        @RequestPart("book") String bookJson,
        @RequestPart(value = "cover", required = false) MultipartFile cover,
        @RequestPart(value = "file", required = false) MultipartFile bookFile
    ) throws Exception {
        BookRequest request = new com.fasterxml.jackson.databind.ObjectMapper()
            .findAndRegisterModules()
            .readValue(bookJson, BookRequest.class);
        BookResponse book = bookService.updateBook(id, request, cover, bookFile);
        return ResponseEntity.ok(ApiResponse.success("Book updated successfully", book));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a book (soft delete)", security = @SecurityRequirement(name = "bearerAuth"))
    public ResponseEntity<ApiResponse<Void>> deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
        return ResponseEntity.ok(ApiResponse.success("Book deleted successfully", null));
    }
}
