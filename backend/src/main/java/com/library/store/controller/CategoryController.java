package com.library.store.controller;

import com.library.store.dto.response.ApiResponse;
import com.library.store.entity.Category;
import com.library.store.exception.DuplicateResourceException;
import com.library.store.exception.ResourceNotFoundException;
import com.library.store.repository.CategoryRepository;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/categories")
@RequiredArgsConstructor
@Tag(name = "Categories", description = "Book categories management")
public class CategoryController {

    private final CategoryRepository categoryRepository;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Category>>> getAllCategories() {
        return ResponseEntity.ok(ApiResponse.success(categoryRepository.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Category>> getCategory(@PathVariable Long id) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        return ResponseEntity.ok(ApiResponse.success(cat));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> createCategory(@RequestBody Map<String, String> body) {
        String name = body.get("name");
        if (categoryRepository.existsByName(name)) {
            throw new DuplicateResourceException("Category already exists: " + name);
        }
        Category cat = Category.builder()
            .name(name)
            .description(body.get("description"))
            .icon(body.get("icon"))
            .build();
        return ResponseEntity.ok(ApiResponse.success("Category created", categoryRepository.save(cat)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Category>> updateCategory(@PathVariable Long id,
                                                                @RequestBody Map<String, String> body) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        if (body.containsKey("name")) cat.setName(body.get("name"));
        if (body.containsKey("description")) cat.setDescription(body.get("description"));
        if (body.containsKey("icon")) cat.setIcon(body.get("icon"));
        return ResponseEntity.ok(ApiResponse.success("Category updated", categoryRepository.save(cat)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        Category cat = categoryRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Category", id));
        categoryRepository.delete(cat);
        return ResponseEntity.ok(ApiResponse.success("Category deleted", null));
    }
}
