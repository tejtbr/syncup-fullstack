package com.syncup.vibecheck.dto;
import lombok.*;
import java.time.LocalDate;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class TeamSummary {
    private LocalDate date;
    private double todayAvgMood;
    private long todayResponseCount;
    private String todayMoodLabel;
    private List<String> anonymousComments;
    private List<DailyAverage> last30Days;
    private List<DeptMood> departmentBreakdown;
}
