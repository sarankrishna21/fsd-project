package com.library.store.controller;

import com.library.store.service.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.MalformedURLException;
import java.nio.file.Path;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Slf4j
public class FileController {

    private final FileStorageService fileStorageService;

    @GetMapping("/covers/{filename:.+}")
    public ResponseEntity<Resource> getCoverImage(@PathVariable String filename) {
        return serveFile("covers", filename, false);
    }

    @GetMapping("/books/{filename:.+}")
    public ResponseEntity<Resource> getBookFile(@PathVariable String filename) {
        // Note: Book file access is controlled at the /library/{bookId}/access endpoint
        // This endpoint serves the file once the URL is obtained through proper auth
        return serveFile("books", filename, true);
    }

    private ResponseEntity<Resource> serveFile(String subfolder, String filename, boolean isDownload) {
        try {
            Path filePath = fileStorageService.getFilePath(subfolder, filename);
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = determineContentType(filename);
            HttpHeaders headers = new HttpHeaders();
            if (isDownload && filename.endsWith(".pdf")) {
                headers.add(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"");
            }

            return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);

        } catch (MalformedURLException e) {
            log.error("Error serving file: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    private String determineContentType(String filename) {
        if (filename.endsWith(".pdf")) return "application/pdf";
        if (filename.endsWith(".epub")) return "application/epub+zip";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) return "image/jpeg";
        if (filename.endsWith(".png")) return "image/png";
        if (filename.endsWith(".webp")) return "image/webp";
        return "application/octet-stream";
    }
}
