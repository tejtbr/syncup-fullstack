package com.syncup.presence.controller;

import com.syncup.presence.dto.ApiResponse;
import com.syncup.presence.dto.IdeaDtos;
import com.syncup.presence.dto.LeaderboardDtos;
import com.syncup.presence.model.User;
import com.syncup.presence.model.UserRole;
import com.syncup.presence.service.IdeaService;
import com.syncup.presence.service.LeaderboardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/ideas")
@RequiredArgsConstructor
public class IdeaController {

    private final IdeaService ideaService;
    private final LeaderboardService leaderboardService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<IdeaDtos.IdeaResponse>>> getAllIdeas(
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            ideaService.getAllIdeas(currentUser.getId())
        ));
    }

    @PostMapping
//    @CacheEvict(value = "leaderboard", allEntries = true)
    public ResponseEntity<ApiResponse<IdeaDtos.IdeaResponse>> submitIdea(
        @AuthenticationPrincipal User currentUser,
        @Valid @RequestBody IdeaDtos.CreateIdeaRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
            ideaService.submitIdea(currentUser.getId(), req)
        ));
    }

    @PostMapping("/{ideaId}/upvote")
//    @CacheEvict(value = "leaderboard", allEntries = true)
    public ResponseEntity<ApiResponse<IdeaDtos.IdeaResponse>> toggleUpvote(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID ideaId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            ideaService.toggleUpvote(ideaId, currentUser.getId())
        ));
    }

    @PatchMapping("/{ideaId}/respond")
//    @CacheEvict(value = "leaderboard", allEntries = true)
    public ResponseEntity<ApiResponse<IdeaDtos.IdeaResponse>> adminRespond(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID ideaId,
        @RequestBody IdeaDtos.AdminUpdateRequest req
    ) {
        if (currentUser.getRole() != UserRole.ADMIN)
            throw new AccessDeniedException("Admin access required");

        return ResponseEntity.ok(ApiResponse.ok(
            ideaService.adminRespond(ideaId, currentUser.getId(), req)
        ));
    }

    @DeleteMapping("/{ideaId}")
//    @CacheEvict(value = "leaderboard", allEntries = true)
    public ResponseEntity<ApiResponse<Void>> deleteIdea(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID ideaId
    ) {
        ideaService.deleteIdea(ideaId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Idea deleted", null));
    }

    /** GET /api/ideas/leaderboard — public, cached */
    @GetMapping("/leaderboard")
    public ResponseEntity<ApiResponse<LeaderboardDtos.LeaderboardResponse>> getLeaderboard() {
        return ResponseEntity.ok(ApiResponse.ok(leaderboardService.getLeaderboard()));
    }
}
