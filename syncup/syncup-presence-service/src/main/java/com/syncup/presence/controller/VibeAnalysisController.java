package com.syncup.presence.controller;

import com.syncup.presence.dto.ApiResponse;
import com.syncup.presence.dto.CommentAnalysisDtos;
import com.syncup.presence.model.User;
import com.syncup.presence.model.UserRole;
import com.syncup.presence.service.CommentAnalysisService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/vibe")
@RequiredArgsConstructor
public class VibeAnalysisController {

    private final CommentAnalysisService commentAnalysisService;

    /**
     * POST /api/admin/vibe/analyze-comments
     * Admin-only endpoint to analyze anonymous comments
     */
    @PostMapping("/analyze-comments")
    public ResponseEntity<ApiResponse<CommentAnalysisDtos.CommentAnalysis>> analyzeComments(
        @AuthenticationPrincipal User currentUser,
        @RequestBody CommentAnalysisDtos.CommentAnalysisRequest request
    ) {
        // Enforce admin-only access
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Admin access required");
        }

        // Analyze comments
        CommentAnalysisDtos.CommentAnalysis analysis = commentAnalysisService.analyzeComments(
            request.getComments()
        );

        return ResponseEntity.ok(ApiResponse.ok(analysis));
    }
}
