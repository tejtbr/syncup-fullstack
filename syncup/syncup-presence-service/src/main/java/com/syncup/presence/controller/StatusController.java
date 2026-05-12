package com.syncup.presence.controller;

import com.syncup.presence.dto.ApiResponse;
import com.syncup.presence.dto.OfficeLocationDto;
import com.syncup.presence.dto.StatusDtos;
import com.syncup.presence.model.User;
import com.syncup.presence.repository.OfficeLocationRepository;
import com.syncup.presence.service.StatusService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/status")
@RequiredArgsConstructor
public class StatusController {

    private final StatusService statusService;
    private final OfficeLocationRepository locationRepository;

    /** Set or update my status for a given day */
    @PostMapping("/me")
    public ResponseEntity<ApiResponse<StatusDtos.StatusResponse>> setMyStatus(
        @AuthenticationPrincipal User currentUser,
        @Valid @RequestBody StatusDtos.SetStatusRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            statusService.setStatus(currentUser.getId(), request)
        ));
    }

    /** Get my status for a given day (defaults to today) */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<StatusDtos.StatusResponse>> getMyStatus(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(
            statusService.getMyStatus(currentUser.getId(), queryDate)
        ));
    }

    /** Get all team members' statuses for today or a given date */
    @GetMapping("/team/{teamId}")
    public ResponseEntity<ApiResponse<List<StatusDtos.MemberStatusDto>>> getTeamDashboard(
        @PathVariable UUID teamId,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(
            statusService.getTeamDashboard(teamId, queryDate)
        ));
    }

    /** Org-wide summary counts for a given date */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<StatusDtos.DashboardSummary>> getOrgSummary(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(
            statusService.getOrgSummary(queryDate)
        ));
    }

    /** Get all available office locations */
    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<OfficeLocationDto>>> getLocations() {
        List<OfficeLocationDto> locations = locationRepository.findAll().stream()
            .map(OfficeLocationDto::from)
            .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(locations));
    }
}
