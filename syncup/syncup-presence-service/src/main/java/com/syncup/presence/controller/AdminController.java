package com.syncup.presence.controller;

import com.syncup.presence.dto.ApiResponse;
import com.syncup.presence.dto.OfficeLocationDto;
import com.syncup.presence.dto.StatusDtos;
import com.syncup.presence.dto.UserDto;
import com.syncup.presence.exception.AppException;
import com.syncup.presence.model.OfficeLocation;
import com.syncup.presence.model.User;
import com.syncup.presence.model.UserRole;
import com.syncup.presence.repository.OfficeLocationRepository;
import com.syncup.presence.repository.UserRepository;
import com.syncup.presence.service.StatusService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final StatusService statusService;
    private final UserRepository userRepository;
    private final OfficeLocationRepository locationRepository;

    // ── Guard helper ──────────────────────────────────────────────────────────
    private void requireAdmin(User user) {
        if (user.getRole() != UserRole.ADMIN) {
            throw new AccessDeniedException("Admin access required");
        }
    }

    // ── Org overview ──────────────────────────────────────────────────────────

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminOverview>> getOverview(
        @AuthenticationPrincipal User currentUser,
        @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        requireAdmin(currentUser);
        LocalDate d = date != null ? date : LocalDate.now();

        StatusDtos.DashboardSummary summary = statusService.getOrgSummary(d);
        long totalUsers = userRepository.count();

        AdminOverview overview = new AdminOverview();
        overview.setDate(d);
        overview.setTotalEmployees(totalUsers);
        overview.setInOffice(summary.getInOffice());
        overview.setRemote(summary.getRemote());
        overview.setOnLeave(summary.getOnLeave());
        overview.setUndecided(summary.getUndecided());
        overview.setNotResponded(totalUsers - summary.getInOffice()
            - summary.getRemote() - summary.getOnLeave() - summary.getUndecided());

        return ResponseEntity.ok(ApiResponse.ok(overview));
    }

    // ── All employees list ────────────────────────────────────────────────────

    @GetMapping("/employees")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllEmployees(
        @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        List<UserDto> users = userRepository.findAll()
            .stream().map(UserDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    // ── Location management ───────────────────────────────────────────────────

    @GetMapping("/locations")
    public ResponseEntity<ApiResponse<List<OfficeLocationDto>>> getLocations(
        @AuthenticationPrincipal User currentUser
    ) {
        requireAdmin(currentUser);
        List<OfficeLocationDto> locs = locationRepository.findAll()
            .stream().map(OfficeLocationDto::from).collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(locs));
    }

    @PostMapping("/locations")
    public ResponseEntity<ApiResponse<OfficeLocationDto>> addLocation(
        @AuthenticationPrincipal User currentUser,
        @Valid @RequestBody LocationRequest req
    ) {
        requireAdmin(currentUser);
        OfficeLocation loc = OfficeLocation.builder()
            .name(req.getName().trim())
            .city(req.getCity() != null ? req.getCity().trim() : null)
            .country(req.getCountry() != null ? req.getCountry().trim() : null)
            .build();
        locationRepository.save(loc);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ApiResponse.ok(OfficeLocationDto.from(loc)));
    }

    @PutMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<OfficeLocationDto>> updateLocation(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID id,
        @Valid @RequestBody LocationRequest req
    ) {
        requireAdmin(currentUser);
        OfficeLocation loc = locationRepository.findById(id)
            .orElseThrow(() -> new AppException("Location not found", HttpStatus.NOT_FOUND));
        loc.setName(req.getName().trim());
        if (req.getCity()    != null) loc.setCity(req.getCity().trim());
        if (req.getCountry() != null) loc.setCountry(req.getCountry().trim());
        locationRepository.save(loc);
        return ResponseEntity.ok(ApiResponse.ok(OfficeLocationDto.from(loc)));
    }

    @DeleteMapping("/locations/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteLocation(
        @AuthenticationPrincipal User currentUser,
        @PathVariable UUID id
    ) {
        requireAdmin(currentUser);
        if (!locationRepository.existsById(id)) {
            throw new AppException("Location not found", HttpStatus.NOT_FOUND);
        }
        locationRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Location deleted", null));
    }

    // ── Inner DTOs ────────────────────────────────────────────────────────────

    @Data
    public static class LocationRequest {
        @NotBlank
        private String name;
        private String city;
        private String country;
    }

    @Data
    public static class AdminOverview {
        private LocalDate date;
        private long totalEmployees;
        private long inOffice;
        private long remote;
        private long onLeave;
        private long undecided;
        private long notResponded;
    }
}
