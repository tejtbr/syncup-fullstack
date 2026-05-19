package com.syncup.vibecheck.service;

import com.syncup.vibecheck.dto.CommentAnalysisDtos;
import com.syncup.vibecheck.model.MoodEntry;
import com.syncup.vibecheck.repository.MoodEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class MoodCommentAnalysisService {

    private final MoodEntryRepository moodEntryRepository;
    private final ChatClient chatClient;

    @Configuration
    public static class AIConfig {
        @Bean
        public ChatClient chatClient(ChatClient.Builder builder) {
            return builder.build();
        }
    }

    /**
     * Analyze mood comments filtered by date range and department
     * @param request Contains dateFrom, dateTo, department filter
     * @return AI-generated analysis of the comments
     */
    public CommentAnalysisDtos.CommentAnalysis analyzeMoodComments(CommentAnalysisDtos.CommentAnalysisRequest request) {
        if (request.getDateFrom() == null || request.getDateTo() == null) {
            return getEmptyAnalysis("Invalid date range provided");
        }

        LocalDate dateFrom = LocalDate.parse(request.getDateFrom(), DateTimeFormatter.ISO_DATE);
        LocalDate dateTo = LocalDate.parse(request.getDateTo(), DateTimeFormatter.ISO_DATE);

        // Fetch mood entries with optional department filter
        List<MoodEntry> moodEntries = moodEntryRepository.findCommentsByDateRangeAndDepartment(
            dateFrom, dateTo, request.getDepartment()
        );

        // Extract comments only
        List<String> comments = moodEntries.stream()
            .map(MoodEntry::getComment)
            .toList();

        if (comments.isEmpty()) {
            return getEmptyAnalysis("No comments found for the selected period and department");
        }

        String period = formatPeriodDescription(dateFrom, dateTo, request.getDepartment());
        return analyzeCommentsWithAI(comments, period);
    }

    /**
     * Analyze provided comments using AI
     */
    private CommentAnalysisDtos.CommentAnalysis analyzeCommentsWithAI(List<String> comments, String period) {
        String commentsText = String.join("\n\n", comments);

        String prompt = """
            You are an expert HR Analyst.
            Analyze the following anonymous team comments from %s.

            Comments:
            %s

            Return **ONLY** valid JSON in this exact format. Do not add any extra text:

            {
              "summaryText": "Professional 2-3 sentence summary of team sentiment",
              "themes": ["theme1", "theme2", "theme3"],
              "suggestedAction": "One clear, actionable recommendation for management",
              "sentiment": {
                "Positive": 65,
                "Neutral": 25,
                "Concern": 10
              }
            }

            Base your analysis only on the actual comments. Be honest and balanced.
            """.formatted(period, commentsText);

        try {
            String rawResponse = chatClient.prompt()
                    .user(prompt)
                    .call()
                    .content();

            return parseAIResponse(rawResponse, comments);

        } catch (Exception e) {
            log.error("AI Analysis failed", e);
            return getFallbackAnalysis(comments, period);
        }
    }

    private CommentAnalysisDtos.CommentAnalysis parseAIResponse(String rawJson, List<String> comments) {
        try {
            String summaryText = extractValue(rawJson, "summaryText", "Team feedback analyzed.");
            List<String> themes = extractList(rawJson, "themes");
            String suggestedAction = extractValue(rawJson, "suggestedAction", "Review feedback with the team.");

            List<CommentAnalysisDtos.SentimentBreakdown> sentimentList = parseSentimentBreakdown(rawJson);

            return CommentAnalysisDtos.CommentAnalysis.builder()
                    .summaryText(summaryText)
                    .themes(themes.isEmpty() ? List.of("General Feedback") : themes)
                    .sentiment(sentimentList)
                    .suggestedAction(suggestedAction)
                    .highlights(comments.stream().limit(3).toList())
                    .totalCommentsAnalyzed((long) comments.size())
                    .build();

        } catch (Exception e) {
            log.warn("JSON parsing failed, using minimal fallback", e);
            return getMinimalFallback(comments);
        }
    }

    private List<CommentAnalysisDtos.SentimentBreakdown> parseSentimentBreakdown(String json) {
        try {
            int positive = extractNumber(json, "Positive", 33);
            int neutral = extractNumber(json, "Neutral", 33);
            int concern = extractNumber(json, "Concern", 34);

            // Ensure total is 100
            int total = positive + neutral + concern;
            if (total != 100 && total > 0) {
                positive = (positive * 100) / total;
                neutral = (neutral * 100) / total;
                concern = 100 - positive - neutral;
            }

            return List.of(
                    CommentAnalysisDtos.SentimentBreakdown.builder().label("Positive").percentage(positive).build(),
                    CommentAnalysisDtos.SentimentBreakdown.builder().label("Neutral").percentage(neutral).build(),
                    CommentAnalysisDtos.SentimentBreakdown.builder().label("Concern").percentage(concern).build()
            );
        } catch (Exception e) {
            return buildEqualSentiment();
        }
    }

    private CommentAnalysisDtos.CommentAnalysis getEmptyAnalysis(String reason) {
        return CommentAnalysisDtos.CommentAnalysis.builder()
                .summaryText("No comments available. " + reason)
                .themes(List.of())
                .sentiment(List.of())
                .suggestedAction("Try adjusting the date range or department filter.")
                .highlights(List.of())
                .totalCommentsAnalyzed(0L)
                .build();
    }

    private CommentAnalysisDtos.CommentAnalysis getFallbackAnalysis(List<String> comments, String period) {
        return CommentAnalysisDtos.CommentAnalysis.builder()
                .summaryText("Insufficient data to generate detailed AI analysis for " + period + ". Please check back when more comments are available.")
                .themes(List.of("Limited Feedback"))
                .sentiment(buildEqualSentiment())
                .suggestedAction("Collect more team feedback for better insights.")
                .highlights(comments.stream().limit(3).toList())
                .totalCommentsAnalyzed((long) comments.size())
                .build();
    }

    private CommentAnalysisDtos.CommentAnalysis getMinimalFallback(List<String> comments) {
        return CommentAnalysisDtos.CommentAnalysis.builder()
                .summaryText("Team has shared " + comments.size() + " comments. AI analysis is currently unavailable.")
                .themes(List.of("Feedback Received"))
                .sentiment(buildEqualSentiment())
                .suggestedAction("Continue gathering team input regularly.")
                .highlights(comments.stream().limit(3).toList())
                .totalCommentsAnalyzed((long) comments.size())
                .build();
    }

    private List<CommentAnalysisDtos.SentimentBreakdown> buildEqualSentiment() {
        return List.of(
                CommentAnalysisDtos.SentimentBreakdown.builder().label("Positive").percentage(33).build(),
                CommentAnalysisDtos.SentimentBreakdown.builder().label("Neutral").percentage(34).build(),
                CommentAnalysisDtos.SentimentBreakdown.builder().label("Concern").percentage(33).build()
        );
    }

    private String formatPeriodDescription(LocalDate from, LocalDate to, String department) {
        StringBuilder description = new StringBuilder();
        description.append("from ").append(from).append(" to ").append(to);
        if (department != null && !department.isBlank()) {
            description.append(" (").append(department).append(" department)");
        }
        return description.toString();
    }

    // ==================== Helper Methods ====================
    private String extractValue(String json, String key, String defaultValue) {
        try {
            String[] parts = json.split("\"" + key + "\"\\s*:\\s*\"");
            if (parts.length > 1) {
                return parts[1].split("\"")[0];
            }
        } catch (Exception ignored) {}
        return defaultValue;
    }

    private List<String> extractList(String json, String key) {
        List<String> list = new java.util.ArrayList<>();
        try {
            String[] parts = json.split("\"" + key + "\"\\s*:\\s*\\[");
            if (parts.length > 1) {
                String arrayContent = parts[1].split("]")[0];
                String[] items = arrayContent.split(",");
                for (String item : items) {
                    String cleaned = item.replace("\"", "").trim();
                    if (!cleaned.isEmpty()) list.add(cleaned);
                }
            }
        } catch (Exception ignored) {}
        return list;
    }

    private int extractNumber(String json, String key, int defaultValue) {
        try {
            String[] parts = json.split("\"" + key + "\"\\s*:\\s*");
            if (parts.length > 1) {
                String num = parts[1].replaceAll("[^0-9]", "").split(",")[0];
                return Integer.parseInt(num);
            }
        } catch (Exception ignored) {}
        return defaultValue;
    }
}
