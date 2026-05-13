package com.syncup.vibecheck.dto;
import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DailyAverage {
    private LocalDate date;
    private double avgMood;
    private long responseCount;
}
