package com.syncup.analytics.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class DepartmentStat {
    private String department;
    private long inOffice;
    private long remote;
    private long onLeave;
    private long undecided;
    private long total;
    private long inOfficePercent;
}
