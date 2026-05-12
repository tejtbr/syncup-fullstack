package com.syncup.analytics.dto;

import lombok.*;
import java.time.LocalDate;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class OrgSummary {
    private LocalDate date;
    private long inOffice;
    private long remote;
    private long onLeave;
    private long undecided;
}
