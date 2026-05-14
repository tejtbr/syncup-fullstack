package com.syncup.presence.repository;

import com.syncup.presence.model.IdeaUpvote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface IdeaUpvoteRepository extends JpaRepository<IdeaUpvote, UUID> {

    Optional<IdeaUpvote> findByIdeaIdAndUserId(UUID ideaId, UUID userId);

    boolean existsByIdeaIdAndUserId(UUID ideaId, UUID userId);
}
