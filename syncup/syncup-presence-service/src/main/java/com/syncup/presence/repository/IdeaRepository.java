package com.syncup.presence.repository;

import com.syncup.presence.model.Idea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface IdeaRepository extends JpaRepository<Idea, UUID> {

    // ── General ───────────────────────────────────────────────────────────
    @Query("SELECT i FROM Idea i ORDER BY i.upvoteCount DESC, i.createdAt DESC")
    List<Idea> findAllOrderedByVotes();

    List<Idea> findBySubmittedByIdOrderByCreatedAtDesc(UUID userId);

    List<Idea> findByStatusOrderByUpvoteCountDesc(Idea.IdeaStatus status);

    // ── Leaderboard ───────────────────────────────────────────────────────

    // Top contributors: group by submitter, count implemented ideas, sum upvotes
    @Query("""
    SELECT i.submittedBy.id, i.submittedBy.fullName, i.submittedBy.department,
           SUM(CASE WHEN i.status = 'IMPLEMENTED' THEN 1 ELSE 0 END) as implementedCount,
           SUM(i.upvoteCount) as totalUpvotes,
           COUNT(i) as totalIdeas
    FROM Idea i
    GROUP BY i.submittedBy.id, i.submittedBy.fullName, i.submittedBy.department
    HAVING SUM(CASE WHEN i.status = 'IMPLEMENTED' THEN 1 ELSE 0 END) > 0
    ORDER BY implementedCount DESC, totalUpvotes DESC
""")
    List<Object[]> getTopContributors();

    // Most upvoted ideas of all time (top 5)
    @Query("SELECT i FROM Idea i ORDER BY i.upvoteCount DESC")
    List<Idea> findTopByUpvotes(org.springframework.data.domain.Pageable pageable);

    // Recently implemented (last 5)
    @Query("SELECT i FROM Idea i WHERE i.status = 'IMPLEMENTED' ORDER BY i.updatedAt DESC")
    List<Idea> findRecentlyImplemented(org.springframework.data.domain.Pageable pageable);

    // Stats
    @Query("SELECT COUNT(i) FROM Idea i WHERE i.status = 'IMPLEMENTED'")
    long countImplemented();

    @Query("SELECT COALESCE(SUM(i.upvoteCount), 0) FROM Idea i")
    long sumAllUpvotes();
}
