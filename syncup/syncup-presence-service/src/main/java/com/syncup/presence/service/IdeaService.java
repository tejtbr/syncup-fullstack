package com.syncup.presence.service;

import com.syncup.presence.dto.IdeaDtos;
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
public class IdeaService {

    private final IdeaRepository ideaRepo;
    private final IdeaUpvoteRepository upvoteRepo;
    private final UserRepository userRepo;

    // ── Submit idea ──────────────────────────────────────────────────────────
    @Transactional
    public IdeaDtos.IdeaResponse submitIdea(UUID userId, IdeaDtos.CreateIdeaRequest req) {
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Idea idea = Idea.builder()
            .submittedBy(user)
            .title(req.getTitle().trim())
            .description(req.getDescription().trim())
            .category(req.getCategory() != null ? req.getCategory() : "Other")
            .build();

        ideaRepo.save(idea);
        log.info("Idea submitted by {} : {}", user.getEmail(), idea.getTitle());
        return IdeaDtos.IdeaResponse.from(idea, false);
    }

    // ── Get all ideas ────────────────────────────────────────────────────────
    public List<IdeaDtos.IdeaResponse> getAllIdeas(UUID currentUserId) {
        return ideaRepo.findAllOrderedByVotes().stream()
            .map(idea -> IdeaDtos.IdeaResponse.from(
                idea,
                upvoteRepo.existsByIdeaIdAndUserId(idea.getId(), currentUserId)
            ))
            .collect(Collectors.toList());
    }

    // ── Toggle upvote ────────────────────────────────────────────────────────
    @Transactional
    public IdeaDtos.IdeaResponse toggleUpvote(UUID ideaId, UUID userId) {
        Idea idea = ideaRepo.findById(ideaId)
            .orElseThrow(() -> new AppException("Idea not found", HttpStatus.NOT_FOUND));
        User user = userRepo.findById(userId)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        var existing = upvoteRepo.findByIdeaIdAndUserId(ideaId, userId);
        if (existing.isPresent()) {
            upvoteRepo.delete(existing.get());
            idea.setUpvoteCount(Math.max(0, idea.getUpvoteCount() - 1));
            ideaRepo.save(idea);
            return IdeaDtos.IdeaResponse.from(idea, false);
        } else {
            IdeaUpvote upvote = IdeaUpvote.builder().idea(idea).user(user).build();
            upvoteRepo.save(upvote);
            idea.setUpvoteCount(idea.getUpvoteCount() + 1);
            ideaRepo.save(idea);
            return IdeaDtos.IdeaResponse.from(idea, true);
        }
    }

    // ── Admin: update status + response ─────────────────────────────────────
    @Transactional
    public IdeaDtos.IdeaResponse adminRespond(UUID ideaId, UUID adminId, IdeaDtos.AdminResponseRequest req) {
        User admin = userRepo.findById(adminId)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        if (admin.getRole() != UserRole.ADMIN) {
            throw new AppException("Admin access required", HttpStatus.FORBIDDEN);
        }

        Idea idea = ideaRepo.findById(ideaId)
            .orElseThrow(() -> new AppException("Idea not found", HttpStatus.NOT_FOUND));

        if (req.getStatus() != null)        idea.setStatus(req.getStatus());
        if (req.getAdminResponse() != null)  idea.setAdminResponse(req.getAdminResponse().trim());
        ideaRepo.save(idea);

        boolean upvotedByAdmin = upvoteRepo.existsByIdeaIdAndUserId(ideaId, adminId);
        return IdeaDtos.IdeaResponse.from(idea, upvotedByAdmin);
    }

    // ── Delete idea (admin or own) ───────────────────────────────────────────
    @Transactional
    public void deleteIdea(UUID ideaId, UUID requestingUserId) {
        Idea idea = ideaRepo.findById(ideaId)
            .orElseThrow(() -> new AppException("Idea not found", HttpStatus.NOT_FOUND));
        User user = userRepo.findById(requestingUserId)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        boolean isOwner = idea.getSubmittedBy().getId().equals(requestingUserId);
        boolean isAdmin  = user.getRole() == UserRole.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new AppException("Not allowed to delete this idea", HttpStatus.FORBIDDEN);
        }
        ideaRepo.delete(idea);
    }
}
