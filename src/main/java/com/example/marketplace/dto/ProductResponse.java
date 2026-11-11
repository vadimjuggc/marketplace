package com.example.marketplace.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProductResponse(
        Long id,
        String title,
        String description,
        BigDecimal price,
        String city,
        Long previewImageId,
        List<Long> imageIds,
        boolean isSold,
        String sellerNickName,
        LocalDateTime createdAt
) {}