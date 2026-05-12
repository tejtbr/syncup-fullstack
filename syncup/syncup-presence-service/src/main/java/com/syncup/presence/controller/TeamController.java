package com.syncup.presence.controller;

import com.syncup.presence.dto.ApiResponse;
import com.syncup.presence.dto.TeamDtos;
import com.syncup.presence.model.User;
import com.syncup.presence.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PostMapping
    public ResponseEntity<ApiResponse<TeamDtos.TeamResponse>> createTeam(
        @AuthenticationPrincipal User currentUser,
        @Valid @RequestBody TeamDtos.CreateTeamRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
            teamService.createTeam(currentUser.getId(), request)
        ));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<TeamDtos.TeamResponse>>> getMyTeams(
        @AuthenticationPrincipal User currentUser
    ) {
        return ResponseEntity.ok(ApiResponse.ok(
            teamService.getMyTeams(currentUser.getId())
        ));
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<ApiResponse<TeamDtos.TeamResponse>> getTeam(
        @PathVariable UUID teamId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getTeam(teamId)));
    }

    @GetMapping("/{teamId}/members")
    public ResponseEntity<ApiResponse<List<TeamDtos.TeamMemberDto>>> getTeamMembers(
        @PathVariable UUID teamId
    ) {
        return ResponseEntity.ok(ApiResponse.ok(teamService.getTeamMembers(teamId)));
    }

    @PostMapping("/{teamId}/members")
    public ResponseEntity<ApiResponse<TeamDtos.TeamMemberDto>> addMember(
        @PathVariable UUID teamId,
        @RequestBody TeamDtos.AddMemberRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.ok(
            teamService.addMember(teamId, request)
        ));
    }

    @DeleteMapping("/{teamId}/members/{userId}")
    public ResponseEntity<ApiResponse<Void>> removeMember(
        @PathVariable UUID teamId,
        @PathVariable UUID userId
    ) {
        teamService.removeMember(teamId, userId);
        return ResponseEntity.ok(ApiResponse.ok("Member removed", null));
    }

    @DeleteMapping("/{teamId}")
    public ResponseEntity<ApiResponse<Void>> deleteTeam(
        @PathVariable UUID teamId,
        @AuthenticationPrincipal User currentUser
    ) {
        teamService.deleteTeam(teamId, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.ok("Team deleted", null));
    }
}
