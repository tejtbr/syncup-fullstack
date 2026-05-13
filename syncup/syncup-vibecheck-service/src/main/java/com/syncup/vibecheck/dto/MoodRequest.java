package com.syncup.vibecheck.dto;
import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class MoodRequest {
    @NotNull @Min(1) @Max(5)
    private Integer moodScore;   // 1=Struggling 2=Low 3=Okay 4=Good 5=Thriving
    private String comment;      // optional anonymous comment
    private String fullName;     // passed from frontend (from auth context)
    private String department;
}
