package com.syncup.presence.dto;

import com.syncup.presence.model.Team;
import com.syncup.presence.model.TeamMember;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.UUID;

public class TeamDtos {

    @Data
    public static class CreateTeamRequest {
        @NotBlank
        private String name;
        private String description;
        private List<UUID> memberIds;
    }

    @Data
    public static class AddMemberRequest {
        private UUID userId;
        private TeamMember.TeamMemberRole role = TeamMember.TeamMemberRole.MEMBER;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamResponse {
        private UUID id;
        private String name;
        private String description;
        private UserDto createdBy;
        private long memberCount;

        public static TeamResponse from(Team team) {
            return TeamResponse.builder()
                .id(team.getId())
                .name(team.getName())
                .description(team.getDescription())
                .createdBy(team.getCreatedBy() != null ? UserDto.from(team.getCreatedBy()) : null)
                .memberCount(team.getMembers().size())
                .build();
        }
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TeamMemberDto {
        private UUID id;
        private UserDto user;
        private TeamMember.TeamMemberRole role;

        public static TeamMemberDto from(TeamMember tm) {
            return TeamMemberDto.builder()
                .id(tm.getId())
                .user(UserDto.from(tm.getUser()))
                .role(tm.getRole())
                .build();
        }
    }
}
