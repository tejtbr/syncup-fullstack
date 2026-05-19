package com.syncup.presence.service;

import com.syncup.presence.dto.LeaderboardDtos;
import com.syncup.presence.model.Idea;
import com.syncup.presence.repository.IdeaRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class LeaderboardService {

    private final IdeaRepository ideaRepo;

//    @Cacheable(value = "leaderboard", key = "'global'")
    public LeaderboardDtos.LeaderboardResponse getLeaderboard() {

        // ── Top contributors ────────────────────────────────────────────
        List<Object[]> rows = ideaRepo.getTopContributors();
        List<LeaderboardDtos.ContributorEntry> contributors = new ArrayList<>();

        for (int i = 0; i < rows.size(); i++) {
            Object[] row = rows.get(i);
            contributors.add(LeaderboardDtos.ContributorEntry.builder()
                .userId((UUID) row[0])
                .fullName((String) row[1])
                .department((String) row[2])
                .implementedCount(((Number) row[3]).intValue())
                .totalUpvotesReceived(((Number) row[4]).intValue())
                .totalIdeasSubmitted(((Number) row[5]).intValue())
                .rank(i + 1)
                .build());
        }

        // ── Most upvoted (top 5) ────────────────────────────────────────
        List<LeaderboardDtos.TopIdeaEntry> mostUpvoted = ideaRepo
            .findTopByUpvotes(PageRequest.of(0, 5))
            .stream()
            .map(this::toTopEntry)
            .collect(Collectors.toList());

        // ── Recently implemented (last 5) ───────────────────────────────
        List<LeaderboardDtos.TopIdeaEntry> recentlyImplemented = ideaRepo
            .findRecentlyImplemented(PageRequest.of(0, 5))
            .stream()
            .map(this::toTopEntry)
            .collect(Collectors.toList());

        // ── Stats ───────────────────────────────────────────────────────
        long totalIdeas       = ideaRepo.count();
        long totalImplemented = ideaRepo.countImplemented();
        long totalUpvotes     = ideaRepo.sumAllUpvotes();

        return LeaderboardDtos.LeaderboardResponse.builder()
            .topContributors(contributors)
            .mostUpvoted(mostUpvoted)
            .recentlyImplemented(recentlyImplemented)
            .totalIdeas(totalIdeas)
            .totalImplemented(totalImplemented)
            .totalUpvotes(totalUpvotes)
            .build();
    }

    private LeaderboardDtos.TopIdeaEntry toTopEntry(Idea idea) {
        String name = idea.getSubmittedBy() != null ? idea.getSubmittedBy().getFullName() : "Unknown";
        String dept = idea.getSubmittedBy() != null ? idea.getSubmittedBy().getDepartment() : null;
        return LeaderboardDtos.TopIdeaEntry.builder()
                .id(idea.getId())
                .title(idea.getTitle())
                .submittedByName(name)
                .submittedByDept(dept)
                .status(idea.getStatus().name())
                .upvoteCount(idea.getUpvoteCount())
                .createdAt(idea.getCreatedAt())
                .build();
    }
}
