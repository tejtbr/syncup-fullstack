package com.syncup.analytics.service;

import com.syncup.analytics.consumer.StatusUpdatedEvent;
import com.syncup.analytics.dto.*;
import com.syncup.analytics.model.DailyPresenceSnapshot;
import com.syncup.analytics.repository.SnapshotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SnapshotService {

    private final SnapshotRepository repo;

    // ── Upsert snapshot from Kafka event ─────────────────────────────────────
    @Transactional
    public void upsertSnapshot(StatusUpdatedEvent event) {
        DailyPresenceSnapshot snap = repo
            .findByUserIdAndSnapshotDate(event.getUserId(), event.getStatusDate())
            .orElse(DailyPresenceSnapshot.builder()
                .userId(event.getUserId())
                .snapshotDate(event.getStatusDate())
                .build());

        snap.setFullName(event.getFullName());
        snap.setDepartment(event.getDepartment());
        snap.setStatus(event.getStatus());
        snap.setOfficeLocationId(event.getOfficeLocationId());
        snap.setOfficeLocationName(event.getOfficeLocationName());
        snap.setOfficeCity(event.getOfficeCity());
        snap.setOfficeCountry(event.getOfficeCountry());
        repo.save(snap);
        log.debug("Upserted snapshot for {} on {}", event.getFullName(), event.getStatusDate());
    }

    // ── Department analytics ──────────────────────────────────────────────────
    public List<DepartmentStat> getDepartmentStats(LocalDate date) {
        List<Object[]> rows = repo.getDepartmentStatusCountsForDate(date);
        return buildDepartmentStats(rows);
    }

    public List<DepartmentStat> getDepartmentStatsRange(LocalDate from, LocalDate to) {
        List<Object[]> rows = repo.getDepartmentStatusCountsForRange(from, to);
        return buildDepartmentStats(rows);
    }

    private List<DepartmentStat> buildDepartmentStats(List<Object[]> rows) {
        // Group by department
        Map<String, Map<String, Long>> deptMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            String dept   = (String) row[0];
            String status = (String) row[1];
            long   count  = ((Number) row[2]).longValue();
            deptMap.computeIfAbsent(dept, k -> new LinkedHashMap<>())
                   .put(status, count);
        }

        return deptMap.entrySet().stream().map(e -> {
            String dept    = e.getKey();
            Map<String,Long> counts = e.getValue();
            long inOffice  = counts.getOrDefault("IN_OFFICE", 0L);
            long remote    = counts.getOrDefault("REMOTE", 0L);
            long onLeave   = counts.getOrDefault("ON_LEAVE", 0L);
            long undecided = counts.getOrDefault("UNDECIDED", 0L);
            long total     = inOffice + remote + onLeave + undecided;
            return DepartmentStat.builder()
                .department(dept)
                .inOffice(inOffice)
                .remote(remote)
                .onLeave(onLeave)
                .undecided(undecided)
                .total(total)
                .inOfficePercent(total > 0 ? Math.round(inOffice * 100.0 / total) : 0)
                .build();
        }).collect(Collectors.toList());
    }

    // ── Location analytics ────────────────────────────────────────────────────
    public List<LocationStat> getLocationStats(LocalDate date) {
        List<Object[]> rows = repo.getLocationOccupancyForDate(date);
        return rows.stream().map(row -> LocationStat.builder()
            .locationName((String) row[0])
            .city((String) row[1])
            .country((String) row[2])
            .locationId((UUID) row[3])
            .inOfficeCount(((Number) row[4]).longValue())
            .build()
        ).collect(Collectors.toList());
    }

    public List<LocationTrendPoint> getLocationTrend(LocalDate from, LocalDate to) {
        List<Object[]> rows = repo.getLocationTrendForRange(from, to);
        return rows.stream().map(row -> LocationTrendPoint.builder()
            .locationName((String) row[0])
            .date((LocalDate) row[1])
            .count(((Number) row[2]).longValue())
            .build()
        ).collect(Collectors.toList());
    }

    public List<PersonAtLocation> getPeopleAtLocation(UUID locationId, LocalDate date) {
        return repo.getPeopleAtLocation(locationId, date).stream()
            .map(s -> PersonAtLocation.builder()
                .fullName(s.getFullName())
                .department(s.getDepartment())
                .build()
            ).collect(Collectors.toList());
    }

    // ── Weekly trends ─────────────────────────────────────────────────────────
    public List<DailyTrend> getWeeklyTrends(int weeks) {
        LocalDate to   = LocalDate.now();
        LocalDate from = to.minusWeeks(weeks);
        List<Object[]> rows = repo.getDailyTrendsForRange(from, to);

        // Build a map: date -> status -> count
        Map<LocalDate, Map<String, Long>> dateMap = new LinkedHashMap<>();
        for (Object[] row : rows) {
            LocalDate date   = (LocalDate) row[0];
            String    status = (String) row[1];
            long      count  = ((Number) row[2]).longValue();
            dateMap.computeIfAbsent(date, k -> new LinkedHashMap<>())
                   .put(status, count);
        }

        return dateMap.entrySet().stream().map(e -> {
            Map<String,Long> counts = e.getValue();
            return DailyTrend.builder()
                .date(e.getKey())
                .dayOfWeek(e.getKey().getDayOfWeek().name())
                .weekNumber(e.getKey().get(WeekFields.ISO.weekOfYear()))
                .inOffice(counts.getOrDefault("IN_OFFICE", 0L))
                .remote(counts.getOrDefault("REMOTE", 0L))
                .onLeave(counts.getOrDefault("ON_LEAVE", 0L))
                .undecided(counts.getOrDefault("UNDECIDED", 0L))
                .build();
        }).collect(Collectors.toList());
    }

    // ── Org summary ───────────────────────────────────────────────────────────
    public OrgSummary getOrgSummary(LocalDate date) {
        List<Object[]> rows = repo.getOrgSummaryForDate(date);
        Map<String, Long> counts = new HashMap<>();
        for (Object[] row : rows) {
            counts.put((String) row[0], ((Number) row[1]).longValue());
        }
        return OrgSummary.builder()
            .date(date)
            .inOffice(counts.getOrDefault("IN_OFFICE", 0L))
            .remote(counts.getOrDefault("REMOTE", 0L))
            .onLeave(counts.getOrDefault("ON_LEAVE", 0L))
            .undecided(counts.getOrDefault("UNDECIDED", 0L))
            .build();
    }
}
