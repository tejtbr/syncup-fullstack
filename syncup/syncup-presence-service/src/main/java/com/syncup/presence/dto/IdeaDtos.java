package com.syncup.presence.dto;

import com.syncup.presence.model.Idea;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

public class IdeaDtos {

    @Data
    public static class CreateIdeaRequest {
        @NotBlank
        @Size(max = 150)
        private String title;

        @NotBlank
        @Size(max = 2000)
        private String description;

        private String category; // Process, Culture, Tech, Perks, Other
    }

    @Data
    public static class AdminResponseRequest {
        private Idea.IdeaStatus status;
        private String adminResponse;
    }

    @Data @Builder @NoArgsConstructor @AllArgsConstructor
    public static class IdeaResponse {
        private UUID id;
        private String title;
        private String description;
        private String category;
        private Idea.IdeaStatus status;
        private String adminResponse;
        private String respondedBy;
        private int upvoteCount;
        private boolean upvotedByMe;
        private String submittedByName;
        private String submittedByDept;
        private LocalDateTime createdAt;

        public static IdeaResponse from(Idea idea, boolean upvotedByMe) {
            IdeaResponse r = new IdeaResponse();
            r.setId(idea.getId());
            r.setTitle(idea.getTitle());
            r.setDescription(idea.getDescription());
            r.setCategory(idea.getCategory());
            r.setStatus(idea.getStatus());
            r.setAdminResponse(idea.getAdminResponse());
            r.setRespondedBy(null);
            r.setUpvoteCount(idea.getUpvoteCount());
            r.setUpvotedByMe(upvotedByMe);
            r.setSubmittedByName(idea.getSubmittedBy() != null ? idea.getSubmittedBy().getFullName() : null);
            r.setSubmittedByDept(idea.getSubmittedBy() != null ? idea.getSubmittedBy().getDepartment() : null);
            r.setCreatedAt(idea.getCreatedAt());
            return r;
        }
    }
}
