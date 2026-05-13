package com.syncup.vibecheck.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "mood_entries",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "entry_date"})
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class MoodEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // Who submitted (from presence service JWT — we just store the userId)
    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "department")
    private String department;

    // 1 = Struggling, 2 = Low, 3 = Okay, 4 = Good, 5 = Thriving
    @Column(name = "mood_score", nullable = false)
    private int moodScore;

    // Optional anonymous comment — "how are you feeling today?"
    @Column(name = "comment", length = 500)
    private String comment;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }
}
