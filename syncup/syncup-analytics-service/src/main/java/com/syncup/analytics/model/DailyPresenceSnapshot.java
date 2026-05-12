package com.syncup.analytics.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * One row per user per day.
 * Updated via Kafka whenever the user changes their status.
 * This is the source of truth for all analytics queries.
 */
@Entity
@Table(
    name = "daily_presence_snapshots",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "snapshot_date"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyPresenceSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(name = "department")
    private String department;

    @Column(name = "status", nullable = false)
    private String status;   // IN_OFFICE | REMOTE | ON_LEAVE | UNDECIDED

    @Column(name = "snapshot_date", nullable = false)
    private LocalDate snapshotDate;

    // Office location fields (populated when status = IN_OFFICE)
    @Column(name = "office_location_id")
    private UUID officeLocationId;

    @Column(name = "office_location_name")
    private String officeLocationName;

    @Column(name = "office_city")
    private String officeCity;

    @Column(name = "office_country")
    private String officeCountry;

    @Column(name = "recorded_at")
    @Builder.Default
    private LocalDateTime recordedAt = LocalDateTime.now();

    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
