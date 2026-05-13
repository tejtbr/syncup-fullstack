package com.syncup.vibecheck.dto;
import lombok.*;
import java.time.LocalDate;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class MoodResponse {
    private UUID id;
    private int moodScore;
    private String moodLabel;
    private String comment;
    private LocalDate entryDate;

    public static String labelFor(int score) {
        return switch (score) {
            case 1 -> "Struggling";
            case 2 -> "Low";
            case 3 -> "Okay";
            case 4 -> "Good";
            case 5 -> "Thriving";
            default -> "Unknown";
        };
    }
}
