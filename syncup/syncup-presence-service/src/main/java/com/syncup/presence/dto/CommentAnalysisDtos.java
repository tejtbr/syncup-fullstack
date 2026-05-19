package com.syncup.presence.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

public class CommentAnalysisDtos {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SentimentBreakdown {
        private String label;  // "Positive", "Neutral", "Concern"
        private int percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentAnalysis {
        private String summaryText;          // 1-2 sentence summary
        private List<String> themes;          // Top 3-4 themes (e.g. "Workload", "Communication")
        private List<SentimentBreakdown> sentiment;  // Breakdown of sentiments
        private String suggestedAction;      // Actionable recommendation for admin
        private List<String> highlights;     // 2-3 representative anonymous quotes
        private long totalCommentsAnalyzed;  // Count of comments processed
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CommentAnalysisRequest {
        private List<String> comments;  // Anonymous comments to analyze
    }
}
