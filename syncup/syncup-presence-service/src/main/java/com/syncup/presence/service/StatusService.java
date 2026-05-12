package com.syncup.presence.service;

import com.syncup.presence.dto.StatusDtos;
import com.syncup.presence.dto.UserDto;
import com.syncup.presence.event.StatusUpdatedEvent;
import com.syncup.presence.exception.AppException;
import com.syncup.presence.model.*;
import com.syncup.presence.repository.*;
import com.syncup.presence.websocket.StatusWebSocketPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StatusService {

    private final UserStatusRepository statusRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final OfficeLocationRepository locationRepository;
    private final StatusWebSocketPublisher wsPublisher;
    private final KafkaTemplate<String, StatusUpdatedEvent> kafkaTemplate;

    private static final String KAFKA_TOPIC = "status.updated";

    @Transactional
    @CacheEvict(value = "teamDashboard", allEntries = true)
    public StatusDtos.StatusResponse setStatus(UUID userId, StatusDtos.SetStatusRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        LocalDate date = request.getDate() != null ? request.getDate() : LocalDate.now();

        OfficeLocation location = null;
        if (request.getStatus() == StatusType.IN_OFFICE && request.getOfficeLocationId() != null) {
            location = locationRepository.findById(request.getOfficeLocationId())
                .orElseThrow(() -> new AppException("Office location not found", HttpStatus.NOT_FOUND));
        }

        UserStatus status = statusRepository
            .findByUserIdAndStatusDate(userId, date)
            .orElse(UserStatus.builder().user(user).statusDate(date).build());

        status.setStatus(request.getStatus());
        status.setOfficeLocation(location);
        status.setNote(request.getNote());
        statusRepository.save(status);

        StatusDtos.StatusResponse response = StatusDtos.StatusResponse.from(status);

        // 1. Broadcast via WebSocket (real-time UI update)
        wsPublisher.broadcastStatusUpdate(response);

        // 2. Publish to Kafka (analytics service consumes this)
        publishKafkaEvent(user, status, location);

        log.info("Status set for user {} on {}: {}", userId, date, request.getStatus());
        return response;
    }

    private void publishKafkaEvent(User user, UserStatus status, OfficeLocation location) {
        try {
            StatusUpdatedEvent event = StatusUpdatedEvent.builder()
                .userId(user.getId())
                .userEmail(user.getEmail())
                .fullName(user.getFullName())
                .department(user.getDepartment())
                .status(status.getStatus().name())
                .statusDate(status.getStatusDate())
                .officeLocationId(location != null ? location.getId() : null)
                .officeLocationName(location != null ? location.getName() : null)
                .officeCity(location != null ? location.getCity() : null)
                .officeCountry(location != null ? location.getCountry() : null)
                .build();

            kafkaTemplate.send(KAFKA_TOPIC, user.getId().toString(), event);
            log.debug("Published Kafka event for user {}", user.getEmail());
        } catch (Exception e) {
            // Don't fail the status update if Kafka is down
            log.error("Failed to publish Kafka event: {}", e.getMessage());
        }
    }

    public StatusDtos.StatusResponse getMyStatus(UUID userId, LocalDate date) {
        return statusRepository.findByUserIdAndStatusDate(userId, date)
            .map(StatusDtos.StatusResponse::from)
            .orElse(null);
    }

    @Cacheable(value = "teamDashboard", key = "#teamId + '_' + #date")
    public List<StatusDtos.MemberStatusDto> getTeamDashboard(UUID teamId, LocalDate date) {
        List<User> members = userRepository.findByTeamId(teamId);
        List<UserStatus> statuses = statusRepository.findTeamStatusesForDate(teamId, date);
        Map<UUID, UserStatus> statusByUserId = statuses.stream()
            .collect(Collectors.toMap(s -> s.getUser().getId(), s -> s));

        return members.stream()
            .map(member -> {
                UserStatus s = statusByUserId.get(member.getId());
                return new StatusDtos.MemberStatusDto(
                    UserDto.from(member),
                    s != null ? s.getStatus() : null,
                    s != null ? s.getNote() : null,
                    s != null && s.getOfficeLocation() != null
                        ? com.syncup.presence.dto.OfficeLocationDto.from(s.getOfficeLocation()) : null
                );
            })
            .collect(Collectors.toList());
    }

    public StatusDtos.DashboardSummary getOrgSummary(LocalDate date) {
        long total    = userRepository.count();
        long inOffice = statusRepository.countByStatusAndDate(StatusType.IN_OFFICE, date);
        long remote   = statusRepository.countByStatusAndDate(StatusType.REMOTE, date);
        long onLeave  = statusRepository.countByStatusAndDate(StatusType.ON_LEAVE, date);
        long undecided= statusRepository.countByStatusAndDate(StatusType.UNDECIDED, date);

        return new StatusDtos.DashboardSummary(date, inOffice, remote, onLeave, undecided, total);
    }

    public List<StatusDtos.MemberStatusDto> getTeamStatusRange(UUID teamId, LocalDate from, LocalDate to) {
        return statusRepository.findTeamStatusesForDateRange(teamId, from, to).stream()
            .map(s -> new StatusDtos.MemberStatusDto(
                UserDto.from(s.getUser()), s.getStatus(), s.getNote(), null
            ))
            .collect(Collectors.toList());
    }
}
