package com.syncup.vibecheck.dto;
import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DeptMood {
    private String department;
    private double avgMood;
    private long responseCount;
    private String moodLabel;
}
