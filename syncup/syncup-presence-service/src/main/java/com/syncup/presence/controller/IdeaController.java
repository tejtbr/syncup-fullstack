package com.syncup.presence.controller;

import com.syncup.presence.dto.ApiResponse;
import com.syncup.presence.dto.IdeaDtos;
import com.syncup.presence.model.User;
import com.syncup.presence.model.UserRole;
import com.syncup.presence.service.IdeaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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

    // All employees see all ideas
    @GetMapping
    public ResponseEntity<ApiResponse<List<IdeaDtos.IdeaResponse>>> getAllIdeas(
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            ideaService.getAllIdeas(currentUser.getId())
        ));
    }

    // Any employee can submit
    @PostMapping
    public ResponseEntity<ApiResponse<IdeaDtos.IdeaResponse>> submitIdea(
        @AuthenticationPrincipal User currentUser,
        @Valid @RequestBody IdeaDtos.CreateIdeaRequest req
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
            ideaService.submitIdea(currentUser.getId(), req)
        ));
    }

    // Any employee can upvote (toggle)
    @PostMapping("/{ideaId}/upvote")
    public ResponseEntity<ApiResponse<IdeaDtos.IdeaResponse>> toggleUpvote(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID ideaId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            ideaService.toggleUpvote(ideaId, currentUser.getId())
        ));
    }

    // Admin only: update status and add response
    @PatchMapping("/{ideaId}/respond")
    public ResponseEntity<ApiResponse<IdeaDtos.IdeaResponse>> adminRespond(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID ideaId,
        @RequestBody IdeaDtos.AdminResponseRequest req
    ) {
        if (currentUser.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Admin access required");
        }
        return ResponseEntity.ok(ApiResponse.ok(
            ideaService.adminRespond(ideaId, currentUser.getId(), req)
        ));
    }

    // Owner or admin can delete
    @DeleteMapping("/{ideaId}")
    public ResponseEntity<ApiResponse<Void>> deleteIdea(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID ideaId
    ) {
        ideaService.deleteIdea(ideaId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Idea deleted", null));
    }
}
