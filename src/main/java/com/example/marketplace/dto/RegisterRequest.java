package com.example.marketplace.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Введите никнейм")
        @Size(min = 3, max = 50, message = "Никнейм должен быть от 3 до 50 символов")
        String nickName,

        @NotBlank(message = "Введите email")
        @Email(message = "Некорректный формат email")
        String email,

        @NotBlank(message = "Введите пароль")
        @Size(min = 6, message = "Пароль должен содержать от 6 символов")
        String password
) {}
