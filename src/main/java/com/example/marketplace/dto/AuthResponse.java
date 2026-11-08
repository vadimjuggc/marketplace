package com.example.marketplace.dto;

public record AuthResponse(
        String token,
        String nickName,
        String role
) {}