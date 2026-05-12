package com.syncup.analytics.dto;

import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DailyTrend {
    private LocalDate date;
    private String    dayOfWeek;
    private int       weekNumber;
    private long      inOffice;
    private long      remote;
    private long      onLeave;
    private long      undecided;
}
