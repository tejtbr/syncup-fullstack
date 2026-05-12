package com.syncup.analytics.repository;

import com.syncup.analytics.model.DailyPresenceSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SnapshotRepository extends JpaRepository<DailyPresenceSnapshot, UUID> {

    // ── Upsert support ────────────────────────────────────────────────────────
    Optional<DailyPresenceSnapshot> findByUserIdAndSnapshotDate(UUID userId, LocalDate date);

    // ── Department analytics ──────────────────────────────────────────────────
    @Query("""
        SELECT s.department, s.status, COUNT(s)
        FROM DailyPresenceSnapshot s
        WHERE s.snapshotDate = :date
        AND s.department IS NOT NULL
        GROUP BY s.department, s.status
        ORDER BY s.department, s.status
    """)
    List<Object[]> getDepartmentStatusCountsForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT s.department, s.status, COUNT(s)
        FROM DailyPresenceSnapshot s
        WHERE s.snapshotDate BETWEEN :from AND :to
        AND s.department IS NOT NULL
        GROUP BY s.department, s.status
        ORDER BY s.department, s.status
    """)
    List<Object[]> getDepartmentStatusCountsForRange(
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    // ── Location analytics ────────────────────────────────────────────────────
    @Query("""
        SELECT s.officeLocationName, s.officeCity, s.officeCountry,
               s.officeLocationId, COUNT(s)
        FROM DailyPresenceSnapshot s
        WHERE s.snapshotDate = :date
        AND s.status = 'IN_OFFICE'
        AND s.officeLocationName IS NOT NULL
        GROUP BY s.officeLocationName, s.officeCity, s.officeCountry, s.officeLocationId
        ORDER BY COUNT(s) DESC
    """)
    List<Object[]> getLocationOccupancyForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT s.officeLocationName, s.snapshotDate, COUNT(s)
        FROM DailyPresenceSnapshot s
        WHERE s.snapshotDate BETWEEN :from AND :to
        AND s.status = 'IN_OFFICE'
        AND s.officeLocationName IS NOT NULL
        GROUP BY s.officeLocationName, s.snapshotDate
        ORDER BY s.snapshotDate ASC, COUNT(s) DESC
    """)
    List<Object[]> getLocationTrendForRange(
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    // Who is at a specific location today
    @Query("""
        SELECT s FROM DailyPresenceSnapshot s
        WHERE s.snapshotDate = :date
        AND s.officeLocationId = :locationId
        AND s.status = 'IN_OFFICE'
        ORDER BY s.department, s.fullName
    """)
    List<DailyPresenceSnapshot> getPeopleAtLocation(
        @Param("locationId") UUID locationId,
        @Param("date") LocalDate date
    );

    // ── Weekly trends ─────────────────────────────────────────────────────────
    @Query("""
        SELECT s.snapshotDate, s.status, COUNT(s)
        FROM DailyPresenceSnapshot s
        WHERE s.snapshotDate BETWEEN :from AND :to
        GROUP BY s.snapshotDate, s.status
        ORDER BY s.snapshotDate ASC
    """)
    List<Object[]> getDailyTrendsForRange(
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    // ── Org summary for a date ────────────────────────────────────────────────
    @Query("""
        SELECT s.status, COUNT(s)
        FROM DailyPresenceSnapshot s
        WHERE s.snapshotDate = :date
        GROUP BY s.status
    """)
    List<Object[]> getOrgSummaryForDate(@Param("date") LocalDate date);
}
