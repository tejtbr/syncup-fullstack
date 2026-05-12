package com.syncup.presence.dto;

import com.syncup.presence.model.StatusType;
import com.syncup.presence.model.UserStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.UUID;

public class StatusDtos {

    @Data
    public static class SetStatusRequest {
        @NotNull
        private StatusType status;
        private LocalDate date;         // defaults to today if null
        private UUID officeLocationId;  // required if status = IN_OFFICE
        private String note;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StatusResponse {
        private UUID id;
        private UserDto user;
        private StatusType status;
        private LocalDate statusDate;
        private OfficeLocationDto officeLocation;
        private String note;

        public static StatusResponse from(UserStatus s) {
            return StatusResponse.builder()
                .id(s.getId())
                .user(UserDto.from(s.getUser()))
                .status(s.getStatus())
                .statusDate(s.getStatusDate())
                .officeLocation(s.getOfficeLocation() != null
                    ? OfficeLocationDto.from(s.getOfficeLocation()) : null)
                .note(s.getNote())
                .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DashboardSummary {
        private LocalDate date;
        private long inOffice;
        private long remote;
        private long onLeave;
        private long undecided;
        private long totalEmployees;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MemberStatusDto {
        private UserDto user;
        private StatusType status;       // null = not set
        private String note;
        private OfficeLocationDto officeLocation;
    }
}
