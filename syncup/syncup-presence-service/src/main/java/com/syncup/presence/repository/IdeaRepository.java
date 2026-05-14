package com.syncup.presence.repository;

import com.syncup.presence.model.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, UUID> {

    @Query("""
        SELECT i FROM Idea i
        JOIN FETCH i.submittedBy
        ORDER BY i.upvoteCount DESC, i.createdAt DESC
    """)
    List<Idea> findAllOrderedByVotes();

    List<Idea> findBySubmittedByIdOrderByCreatedAtDesc(UUID userId);

    List<Idea> findByCategoryOrderByUpvoteCountDesc(String category);
}
