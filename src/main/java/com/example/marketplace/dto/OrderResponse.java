package com.example.marketplace.dto;

import com.example.marketplace.entity.OrderStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long orderId,
        Long productId,
        String productTitle,
        BigDecimal price,
        OrderStatus status,
        LocalDateTime createdAt
) {}