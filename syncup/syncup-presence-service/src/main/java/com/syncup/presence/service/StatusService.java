package com.syncup.presence.service;

import com.syncup.presence.dto.StatusDtos;
import com.syncup.presence.dto.UserDto;
import com.syncup.presence.exception.AppException;
import com.syncup.presence.model.*;
import com.syncup.presence.repository.*;
import com.syncup.presence.websocket.StatusWebSocketPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpStatus;
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

        // Upsert: update existing or create new
        UserStatus status = statusRepository
            .findByUserIdAndStatusDate(userId, date)
            .orElse(UserStatus.builder().user(user).statusDate(date).build());

        status.setStatus(request.getStatus());
        status.setOfficeLocation(location);
        status.setNote(request.getNote());
        statusRepository.save(status);

        StatusDtos.StatusResponse response = StatusDtos.StatusResponse.from(status);

        // Broadcast update to all subscribers via WebSocket
        wsPublisher.broadcastStatusUpdate(response);

        log.info("Status set for user {} on {}: {}", userId, date, request.getStatus());
        return response;
    }

    public StatusDtos.StatusResponse getMyStatus(UUID userId, LocalDate date) {
        return statusRepository.findByUserIdAndStatusDate(userId, date)
            .map(StatusDtos.StatusResponse::from)
            .orElse(null);
    }

    @Cacheable(value = "teamDashboard", key = "#teamId + '_' + #date")
    public List<StatusDtos.MemberStatusDto> getTeamDashboard(UUID teamId, LocalDate date) {
        // Get all team members
        List<User> members = userRepository.findByTeamId(teamId);

        // Get statuses for those members on that date
        List<UserStatus> statuses = statusRepository.findTeamStatusesForDate(teamId, date);
        Map<UUID, UserStatus> statusByUserId = statuses.stream()
            .collect(Collectors.toMap(s -> s.getUser().getId(), s -> s));

        // Merge: every member appears, even if they haven't set a status
        return members.stream()
            .map(member -> {
                UserStatus s = statusByUserId.get(member.getId());
                return StatusDtos.MemberStatusDto.builder()
                    .user(UserDto.from(member))
                    .status(s != null ? s.getStatus() : null)
                    .note(s != null ? s.getNote() : null)
                    .officeLocation(s != null && s.getOfficeLocation() != null
                        ? com.syncup.presence.dto.OfficeLocationDto.from(s.getOfficeLocation()) : null)
                    .build();
            })
            .collect(Collectors.toList());
    }

    public StatusDtos.DashboardSummary getOrgSummary(LocalDate date) {
        long total = userRepository.count();
        long inOffice = statusRepository.countByStatusAndDate(StatusType.IN_OFFICE, date);
        long remote = statusRepository.countByStatusAndDate(StatusType.REMOTE, date);
        long onLeave = statusRepository.countByStatusAndDate(StatusType.ON_LEAVE, date);
        long undecided = statusRepository.countByStatusAndDate(StatusType.UNDECIDED, date);

        return StatusDtos.DashboardSummary.builder()
            .date(date)
            .inOffice(inOffice)
            .remote(remote)
            .onLeave(onLeave)
            .undecided(undecided)
            .totalEmployees(total)
            .build();
    }

    public List<StatusDtos.MemberStatusDto> getTeamStatusRange(UUID teamId, LocalDate from, LocalDate to) {
        List<UserStatus> statuses = statusRepository.findTeamStatusesForDateRange(teamId, from, to);
        return statuses.stream()
            .map(s -> StatusDtos.MemberStatusDto.builder()
                .user(UserDto.from(s.getUser()))
                .status(s.getStatus())
                .note(s.getNote())
                .build())
            .collect(Collectors.toList());
    }
}
