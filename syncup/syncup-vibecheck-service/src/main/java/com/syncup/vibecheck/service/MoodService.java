package com.syncup.vibecheck.service;

import com.syncup.vibecheck.dto.*;
import com.syncup.vibecheck.model.MoodEntry;
import com.syncup.vibecheck.repository.MoodEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoodService {

    private final MoodEntryRepository repo;

    // ── Submit / update mood ───────────────────────────────────────────────
    @Transactional
    public MoodResponse submitMood(UUID userId, MoodRequest req) {
        MoodEntry entry = repo.findByUserIdAndEntryDate(userId, LocalDate.now())
            .orElse(MoodEntry.builder()
                .userId(userId)
                .entryDate(LocalDate.now())
                .build());

        entry.setMoodScore(req.getMoodScore());
        entry.setComment(req.getComment() != null && !req.getComment().isBlank()
            ? req.getComment().trim() : null);
        entry.setFullName(req.getFullName());
        entry.setDepartment(req.getDepartment());
        repo.save(entry);

        log.info("Mood submitted: user={} score={}", userId, req.getMoodScore());
        return toResponse(entry);
    }

    // ── My mood today ──────────────────────────────────────────────────────
    public MoodResponse getMyMoodToday(UUID userId) {
        return repo.findByUserIdAndEntryDate(userId, LocalDate.now())
            .map(this::toResponse)
            .orElse(null);
    }

    // ── My full history ────────────────────────────────────────────────────
    public List<MoodResponse> getMyHistory(UUID userId) {
        return repo.findByUserIdOrderByEntryDateDesc(userId)
            .stream().map(this::toResponse).collect(Collectors.toList());
    }

    // ── Team summary dashboard ─────────────────────────────────────────────
    public TeamSummary getTeamSummary() {
        LocalDate today  = LocalDate.now();
        LocalDate from30 = today.minusDays(29);

        Double avgToday = repo.getAverageMoodForDate(today);
        long countToday = repo.countByEntryDate(today);

        // Anonymous comments today (no names attached)
        List<String> comments = repo.findTodaysComments(today)
            .stream()
            .map(MoodEntry::getComment)
            .collect(Collectors.toList());

        // Last 30 days daily averages
        List<DailyAverage> last30 = repo.getDailyAverages(from30, today)
            .stream().map(row -> DailyAverage.builder()
                .date((LocalDate) row[0])
                .avgMood(round((Double) row[1]))
                .responseCount(((Number) row[2]).longValue())
                .build()
            ).collect(Collectors.toList());

        // Department breakdown (last 7 days)
        List<DeptMood> deptBreakdown = repo.getDepartmentAverages(today.minusDays(6), today)
            .stream().map(row -> {
                double avg = round((Double) row[1]);
                return DeptMood.builder()
                    .department((String) row[0])
                    .avgMood(avg)
                    .responseCount(((Number) row[2]).longValue())
                    .moodLabel(MoodResponse.labelFor((int) Math.round(avg)))
                    .build();
            }).collect(Collectors.toList());

        double todayAvg = avgToday != null ? round(avgToday) : 0.0;
        return TeamSummary.builder()
            .date(today)
            .todayAvgMood(todayAvg)
            .todayResponseCount(countToday)
            .todayMoodLabel(MoodResponse.labelFor((int) Math.round(todayAvg)))
            .anonymousComments(comments)
            .last30Days(last30)
            .departmentBreakdown(deptBreakdown)
            .build();
    }

    // ── Helpers ────────────────────────────────────────────────────────────
    private MoodResponse toResponse(MoodEntry e) {
        return MoodResponse.builder()
            .id(e.getId())
            .moodScore(e.getMoodScore())
            .moodLabel(MoodResponse.labelFor(e.getMoodScore()))
            .comment(e.getComment())
            .entryDate(e.getEntryDate())
            .build();
    }

    private double round(double val) {
        return Math.round(val * 10.0) / 10.0;
    }
}
