package com.syncup.presence.dto;

import com.syncup.presence.model.User;
import com.syncup.presence.model.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private UUID id;
    private String email;
    private String fullName;
    private String department;
    private String avatarUrl;
    private UserRole role;

    public static UserDto from(User user) {
        return UserDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .fullName(user.getFullName())
            .department(user.getDepartment())
            .avatarUrl(user.getAvatarUrl())
            .role(user.getRole())
            .build();
    }
}
