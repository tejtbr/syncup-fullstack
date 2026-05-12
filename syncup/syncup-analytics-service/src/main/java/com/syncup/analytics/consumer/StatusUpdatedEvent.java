package com.syncup.analytics.consumer;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatusUpdatedEvent {
    private UUID userId;
    private String userEmail;
    private String fullName;
    private String department;
    private String status;           // IN_OFFICE | REMOTE | ON_LEAVE | UNDECIDED
    private LocalDate statusDate;
    private UUID officeLocationId;
    private String officeLocationName;
    private String officeCity;
    private String officeCountry;
}
