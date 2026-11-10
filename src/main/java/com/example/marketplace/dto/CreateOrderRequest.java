package com.example.marketplace.dto;

import jakarta.validation.constraints.NotNull;

public record CreateOrderRequest(
        @NotNull(message = "ID товара обязателен")
        Long productId
) {}