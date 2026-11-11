package com.example.marketplace.dto;

import java.time.LocalDateTime;
import java.util.List;

public record UserPublicResponse(
        Long id,
        String nickName,
        String email,
        LocalDateTime registeredAt,
        List<ProductResponse> products
) {}