package com.syncup.analytics.dto;

import lombok.*;
import java.util.UUID;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class LocationStat {
    private UUID   locationId;
    private String locationName;
    private String city;
    private String country;
    private long   inOfficeCount;
}
