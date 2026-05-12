package com.syncup.presence.repository;

import com.syncup.presence.model.StatusType;
import com.syncup.presence.model.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserStatusRepository extends JpaRepository<UserStatus, UUID> {

    Optional<UserStatus> findByUserIdAndStatusDate(UUID userId, LocalDate date);

    List<UserStatus> findByStatusDate(LocalDate date);

    @Query("""
        SELECT us FROM UserStatus us
        JOIN FETCH us.user u
        WHERE us.statusDate = :date
        AND u.id IN (
            SELECT tm.user.id FROM TeamMember tm WHERE tm.team.id = :teamId
        )
    """)
    List<UserStatus> findTeamStatusesForDate(@Param("teamId") UUID teamId, @Param("date") LocalDate date);

    @Query("""
        SELECT us FROM UserStatus us
        JOIN FETCH us.user u
        LEFT JOIN FETCH us.officeLocation
        WHERE us.statusDate BETWEEN :from AND :to
        AND u.id IN (
            SELECT tm.user.id FROM TeamMember tm WHERE tm.team.id = :teamId
        )
        ORDER BY us.statusDate DESC
    """)
    List<UserStatus> findTeamStatusesForDateRange(
        @Param("teamId") UUID teamId,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("""
        SELECT us.status, COUNT(us) FROM UserStatus us
        WHERE us.statusDate = :date
        GROUP BY us.status
    """)
    List<Object[]> countByStatusForDate(@Param("date") LocalDate date);

    @Query("""
        SELECT COUNT(us) FROM UserStatus us
        WHERE us.statusDate = :date AND us.status = :status
    """)
    long countByStatusAndDate(@Param("status") StatusType status, @Param("date") LocalDate date);
}
