package com.syncup.presence.dto;

import com.syncup.presence.model.OfficeLocation;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public class OfficeLocationDto {
        private UUID id;
    private String name;
    private String city;
    private String country;

    public static OfficeLocationDto from(OfficeLocation loc) {
        return OfficeLocationDto    .builder()
            .id(loc.getId())
            .name(loc.getName())
            .city(loc.getCity())
            .country(loc.getCountry())
            .build();
    }
}
