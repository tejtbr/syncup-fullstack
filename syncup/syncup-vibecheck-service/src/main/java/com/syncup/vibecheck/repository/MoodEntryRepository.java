package com.syncup.vibecheck.repository;

import com.syncup.vibecheck.model.MoodEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MoodEntryRepository extends JpaRepository<MoodEntry, UUID> {

    Optional<MoodEntry> findByUserIdAndEntryDate(UUID userId, LocalDate date);

    // Team mood for a date range (for heatmap)
    @Query("""
        SELECT m FROM MoodEntry m
        WHERE m.entryDate BETWEEN :from AND :to
        ORDER BY m.entryDate DESC
    """)
    List<MoodEntry> findAllInRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // Average mood per day for last N days (team-wide)
    @Query("""
        SELECT m.entryDate, AVG(m.moodScore), COUNT(m)
        FROM MoodEntry m
        WHERE m.entryDate BETWEEN :from AND :to
        GROUP BY m.entryDate
        ORDER BY m.entryDate ASC
    """)
    List<Object[]> getDailyAverages(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // Department mood averages
    @Query("""
        SELECT m.department, AVG(m.moodScore), COUNT(m)
        FROM MoodEntry m
        WHERE m.entryDate BETWEEN :from AND :to
        AND m.department IS NOT NULL
        GROUP BY m.department
        ORDER BY AVG(m.moodScore) ASC
    """)
    List<Object[]> getDepartmentAverages(@Param("from") LocalDate from, @Param("to") LocalDate to);

    // My own history
    List<MoodEntry> findByUserIdOrderByEntryDateDesc(UUID userId);

    // Today's entries with comments (for manager — anonymous)
    @Query("""
        SELECT m FROM MoodEntry m
        WHERE m.entryDate = :date
        AND m.comment IS NOT NULL
        AND m.comment <> ''
        ORDER BY m.moodScore ASC
    """)
    List<MoodEntry> findTodaysComments(@Param("date") LocalDate date);

    // Count of responses today
    long countByEntryDate(LocalDate date);

    // Average mood today
    @Query("SELECT AVG(m.moodScore) FROM MoodEntry m WHERE m.entryDate = :date")
    Double getAverageMoodForDate(@Param("date") LocalDate date);

    // Get comments by date range and optional department filter
    @Query("""
        SELECT m FROM MoodEntry m
        WHERE m.entryDate BETWEEN :from AND :to
        AND m.comment IS NOT NULL
        AND m.comment <> ''
        AND (:department IS NULL OR m.department = :department)
        ORDER BY m.entryDate DESC
    """)
    List<MoodEntry> findCommentsByDateRangeAndDepartment(
        @Param("from") LocalDate from,
        @Param("to") LocalDate to,
        @Param("department") String department
    );
}
