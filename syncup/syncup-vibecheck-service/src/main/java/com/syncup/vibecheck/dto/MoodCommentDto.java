package com.syncup.vibecheck.dto;

import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MoodCommentDto {
    private UUID id;
    private String comment;
    private LocalDateTime createdAt;
    private String department;
    private LocalDate entryDate;
    private String fullName;
    private int moodScore;
    private LocalDateTime updatedAt;
    private UUID userId;
}
