package com.syncup.presence.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdatedEvent {
    private UUID userId;
    private String userEmail;
    private String fullName;
    private String department;
    private String status;
    private LocalDate statusDate;
    private UUID officeLocationId;
    private String officeLocationName;
    private String officeCity;
    private String officeCountry;
}
