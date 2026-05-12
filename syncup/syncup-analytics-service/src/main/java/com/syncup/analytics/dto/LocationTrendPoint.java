package com.syncup.analytics.dto;

import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LocationTrendPoint {
    private String    locationName;
    private LocalDate date;
    private long      count;
}
