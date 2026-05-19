package com.syncup.vibecheck.controller;

import com.syncup.vibecheck.dto.*;
import com.syncup.vibecheck.service.MoodService;
import com.syncup.vibecheck.service.MoodCommentAnalysisService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/vibe")
@RequiredArgsConstructor
public class MoodController {

    private final MoodService moodService;
    private final MoodCommentAnalysisService commentAnalysisService;

    /**
     * Submit or update mood for today
     * POST /api/vibe/mood?userId=<uuid>
     * Body: { moodScore: 1-5, comment: "optional", fullName: "Alice", department: "Engineering" }
     *
     * NOTE: userId comes from query param because this service has no JWT setup.
     * The frontend passes the userId it already has from the presence service JWT.
     */
    @PostMapping("/mood")
    public ResponseEntity<ApiResponse<MoodResponse>> submitMood(
        @RequestParam UUID userId,
        @Valid @RequestBody MoodRequest request
    ) {
        return ResponseEntity.ok(ApiResponse.ok(moodService.submitMood(userId, request)));
    }

    /**
     * Get my mood for today
     * GET /api/vibe/mood/me?userId=<uuid>
     */
    @GetMapping("/mood/me")
    public ResponseEntity<ApiResponse<MoodResponse>> getMyMoodToday(
        @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(moodService.getMyMoodToday(userId)));
    }

    /**
     * Get my full mood history
     * GET /api/vibe/mood/history?userId=<uuid>
     */
    @GetMapping("/mood/history")
    public ResponseEntity<ApiResponse<List<MoodResponse>>> getMyHistory(
        @RequestParam UUID userId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(moodService.getMyHistory(userId)));
    }

    /**
     * Team summary dashboard (for manager view)
     * GET /api/vibe/dashboard
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<TeamSummary>> getDashboard() {
        return ResponseEntity.ok(ApiResponse.ok(moodService.getTeamSummary()));
    }

    /**
     * Analyze mood comments by date range and department
     * POST /api/vibe/analyze-comments
     * Admin-only endpoint to analyze anonymous comments from mood_entries table
     */
    @PostMapping("/analyze-comments")
    public ResponseEntity<ApiResponse<CommentAnalysisDtos.CommentAnalysis>> analyzeMoodComments(
        @Valid @RequestBody CommentAnalysisDtos.CommentAnalysisRequest request
    ) {
        CommentAnalysisDtos.CommentAnalysis analysis = commentAnalysisService.analyzeMoodComments(request);
        return ResponseEntity.ok(ApiResponse.ok(analysis));
    }
}
