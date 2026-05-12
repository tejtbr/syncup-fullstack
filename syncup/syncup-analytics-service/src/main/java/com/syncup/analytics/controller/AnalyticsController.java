package com.syncup.analytics.controller;

import com.syncup.analytics.dto.*;
import com.syncup.analytics.service.SnapshotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final SnapshotService snapshotService;

    /**
     * Department breakdown for a single day
     * GET /api/analytics/department?date=2025-05-11
     */
    @GetMapping("/department")
    public ResponseEntity<ApiResponse<List<DepartmentStat>>> getDepartmentStats(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getDepartmentStats(queryDate)));
    }

    /**
     * Department breakdown over a date range
     * GET /api/analytics/department/range?from=2025-05-01&to=2025-05-11
     */
    @GetMapping("/department/range")
    public ResponseEntity<ApiResponse<List<DepartmentStat>>> getDepartmentRange(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getDepartmentStatsRange(from, to)));
    }

    /**
     * Location occupancy for a single day
     * GET /api/analytics/location?date=2025-05-11
     */
    @GetMapping("/location")
    public ResponseEntity<ApiResponse<List<LocationStat>>> getLocationStats(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getLocationStats(queryDate)));
    }

    /**
     * Location trend over last N days
     * GET /api/analytics/location/trend?from=2025-05-01&to=2025-05-11
     */
    @GetMapping("/location/trend")
    public ResponseEntity<ApiResponse<List<LocationTrendPoint>>> getLocationTrend(
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
        @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getLocationTrend(from, to)));
    }

    /**
     * Who is at a specific office location today
     * GET /api/analytics/location/{locationId}/people?date=2025-05-11
     */
    @GetMapping("/location/{locationId}/people")
    public ResponseEntity<ApiResponse<List<PersonAtLocation>>> getPeopleAtLocation(
        @PathVariable UUID locationId,
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getPeopleAtLocation(locationId, queryDate)));
    }

    /**
     * Weekly trends for last N weeks (default 4)
     * GET /api/analytics/trends?weeks=4
     */
    @GetMapping("/trends")
    public ResponseEntity<ApiResponse<List<DailyTrend>>> getWeeklyTrends(
        @RequestParam(defaultValue = "4") int weeks
    ) {
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getWeeklyTrends(weeks)));
    }

    /**
     * Org summary for a date
     * GET /api/analytics/summary?date=2025-05-11
     */
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<OrgSummary>> getOrgSummary(
        @RequestParam(required = false)
        @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        LocalDate queryDate = date != null ? date : LocalDate.now();
        return ResponseEntity.ok(ApiResponse.ok(snapshotService.getOrgSummary(queryDate)));
    }
}
