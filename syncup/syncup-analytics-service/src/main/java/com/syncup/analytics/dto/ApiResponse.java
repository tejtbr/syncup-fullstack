package com.syncup.analytics.dto;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ApiResponse<T> {
    private boolean success;
    private T data;
    private String message;

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(true, data, null);
    }
    public static <T> ApiResponse<T> error(String msg) {
        return new ApiResponse<>(false, null, msg);
    }
}
