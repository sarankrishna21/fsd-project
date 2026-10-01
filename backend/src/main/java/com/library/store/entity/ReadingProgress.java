package com.library.store.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "reading_progress", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "book_id"})
})
@EntityListeners(AuditingEntityListener.class)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class ReadingProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "book_id", nullable = false)
    private Book book;

    @Column(name = "current_page")
    private Integer currentPage = 1;

    @Column(name = "total_pages")
    private Integer totalPages = 0;

    @Column(name = "progress_percentage")
    private Double progressPercentage = 0.0;

    private Boolean completed = false;

    @LastModifiedDate
    @Column(name = "last_read_at")
    private LocalDateTime lastReadAt;
}
