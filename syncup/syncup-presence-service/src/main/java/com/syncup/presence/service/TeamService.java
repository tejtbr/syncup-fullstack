package com.syncup.presence.service;

import com.syncup.presence.dto.TeamDtos;
import com.syncup.presence.exception.AppException;
import com.syncup.presence.model.*;
import com.syncup.presence.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeamService {

    private final TeamRepository teamRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final UserRepository userRepository;

    @Transactional
    public TeamDtos.TeamResponse createTeam(UUID creatorId, TeamDtos.CreateTeamRequest request) {
        User creator = userRepository.findById(creatorId)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Team team = Team.builder()
            .name(request.getName())
            .description(request.getDescription())
            .createdBy(creator)
            .build();

        teamRepository.save(team);

        // Add creator as LEAD
        TeamMember creatorMember = TeamMember.builder()
            .team(team)
            .user(creator)
            .role(TeamMember.TeamMemberRole.LEAD)
            .build();
        teamMemberRepository.save(creatorMember);

        // Add additional members
        if (request.getMemberIds() != null) {
            for (UUID memberId : request.getMemberIds()) {
                if (!memberId.equals(creatorId)) {
                    userRepository.findById(memberId).ifPresent(user -> {
                        TeamMember member = TeamMember.builder()
                            .team(team)
                            .user(user)
                            .role(TeamMember.TeamMemberRole.MEMBER)
                            .build();
                        teamMemberRepository.save(member);
                    });
                }
            }
        }

        log.info("Team '{}' created by user {}", team.getName(), creatorId);
        return TeamDtos.TeamResponse.from(team);
    }

    public List<TeamDtos.TeamResponse> getMyTeams(UUID userId) {
        return teamRepository.findByMemberId(userId).stream()
            .map(TeamDtos.TeamResponse::from)
            .collect(Collectors.toList());
    }

    public TeamDtos.TeamResponse getTeam(UUID teamId) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new AppException("Team not found", HttpStatus.NOT_FOUND));
        return TeamDtos.TeamResponse.from(team);
    }

    public List<TeamDtos.TeamMemberDto> getTeamMembers(UUID teamId) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new AppException("Team not found", HttpStatus.NOT_FOUND));
        return team.getMembers().stream()
            .map(TeamDtos.TeamMemberDto::from)
            .collect(Collectors.toList());
    }

    @Transactional
    public TeamDtos.TeamMemberDto addMember(UUID teamId, TeamDtos.AddMemberRequest request) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new AppException("Team not found", HttpStatus.NOT_FOUND));

        User user = userRepository.findById(request.getUserId())
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (teamMemberRepository.existsByTeamIdAndUserId(teamId, request.getUserId())) {
            throw new AppException("User is already a member", HttpStatus.CONFLICT);
        }

        TeamMember member = TeamMember.builder()
            .team(team)
            .user(user)
            .role(request.getRole())
            .build();

        teamMemberRepository.save(member);
        return TeamDtos.TeamMemberDto.from(member);
    }

    @Transactional
    public void removeMember(UUID teamId, UUID userId) {
        if (!teamMemberRepository.existsByTeamIdAndUserId(teamId, userId)) {
            throw new AppException("Member not found in team", HttpStatus.NOT_FOUND);
        }
        teamMemberRepository.deleteByTeamIdAndUserId(teamId, userId);
    }

    @Transactional
    public void deleteTeam(UUID teamId, UUID requestingUserId) {
        Team team = teamRepository.findById(teamId)
            .orElseThrow(() -> new AppException("Team not found", HttpStatus.NOT_FOUND));

        if (!team.getCreatedBy().getId().equals(requestingUserId)) {
            throw new AppException("Only the team creator can delete a team", HttpStatus.FORBIDDEN);
        }

        teamRepository.delete(team);
    }
}
