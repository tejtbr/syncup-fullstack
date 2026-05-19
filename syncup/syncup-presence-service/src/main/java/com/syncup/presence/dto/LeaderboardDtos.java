package com.syncup.presence.dto;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class LeaderboardDtos {

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class ContributorEntry {
        private UUID userId;
        private String fullName;
        private String department;
        private int implementedCount;
        private int totalUpvotesReceived;
        private int totalIdeasSubmitted;
        private int rank;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class TopIdeaEntry {
        private UUID id;
        private String title;
        private String submittedByName;
        private String submittedByDept;
        private String status;
        private int upvoteCount;
        private LocalDateTime createdAt;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class LeaderboardResponse {
        private List<ContributorEntry> topContributors;
        private List<TopIdeaEntry> mostUpvoted;
        private List<TopIdeaEntry> recentlyImplemented;
        private long totalIdeas;
        private long totalImplemented;
        private long totalUpvotes;
    }
}
