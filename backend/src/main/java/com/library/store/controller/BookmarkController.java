package com.library.store.controller;

import com.library.store.dto.response.ApiResponse;
import com.library.store.entity.Bookmark;
import com.library.store.service.BookmarkService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bookmarks")
@RequiredArgsConstructor
@Tag(name = "Bookmarks", description = "Book page bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    @GetMapping("/{bookId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<List<Bookmark>>> getBookmarks(@PathVariable Long bookId) {
        return ResponseEntity.ok(ApiResponse.success(bookmarkService.getBookmarks(bookId)));
    }

    @PostMapping("/{bookId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Bookmark>> addBookmark(
        @PathVariable Long bookId,
        @RequestBody Map<String, Object> body
    ) {
        Integer pageNumber = (Integer) body.get("pageNumber");
        String note = (String) body.getOrDefault("note", "");
        Bookmark bookmark = bookmarkService.addBookmark(bookId, pageNumber, note);
        return ResponseEntity.ok(ApiResponse.success("Bookmark added", bookmark));
    }

    @DeleteMapping("/{bookmarkId}")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(@PathVariable Long bookmarkId) {
        bookmarkService.removeBookmark(bookmarkId);
        return ResponseEntity.ok(ApiResponse.success("Bookmark removed", null));
    }
}
