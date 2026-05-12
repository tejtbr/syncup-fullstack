package com.syncup.presence.repository;

import com.syncup.presence.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
        SELECT u FROM User u
        JOIN TeamMember tm ON tm.user = u
        WHERE tm.team.id = :teamId
    """)
    List<User> findByTeamId(@Param("teamId") UUID teamId);

    List<User> findByDepartment(String department);
}
