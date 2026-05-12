package com.syncup.presence.repository;

import com.syncup.presence.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TeamRepository extends JpaRepository<Team, UUID> {

    @Query("""
        SELECT t FROM Team t
        JOIN TeamMember tm ON tm.team = t
        WHERE tm.user.id = :userId
    """)
    List<Team> findByMemberId(@Param("userId") UUID userId);

    @Query("""
        SELECT COUNT(tm) FROM TeamMember tm WHERE tm.team.id = :teamId
    """)
    long countMembers(@Param("teamId") UUID teamId);
}
