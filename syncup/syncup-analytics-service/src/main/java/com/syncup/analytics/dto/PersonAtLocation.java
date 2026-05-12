package com.syncup.analytics.dto;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class PersonAtLocation {
    private String fullName;
    private String department;
}
