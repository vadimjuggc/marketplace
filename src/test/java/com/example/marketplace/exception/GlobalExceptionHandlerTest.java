package com.example.marketplace.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.BindException;
import org.springframework.validation.FieldError;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("handleResourceNotFoundException возвращает 404 и текст ошибки")
    void handleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Товар не найден");
        Map<String, String> response = exceptionHandler.handleResourceNotFoundException(ex);

        assertEquals("Товар не найден", response.get("message"));
    }

    @Test
    @DisplayName("handleUserAlreadyExistsException возвращает сообщение об уже существующем пользователе")
    void handleUserAlreadyExistsException() {
        UserAlreadyExistsException ex = new UserAlreadyExistsException("Email уже занят");
        Map<String, String> response = exceptionHandler.handleUserAlreadyExistsException(ex);

        assertEquals("Email уже занят", response.get("message"));
    }

    @Test
    @DisplayName("handleBadCredentialsException возвращает сообщение о неверных учетных данных")
    void handleBadCredentialsException() {
        BadCredentialsException ex = new BadCredentialsException("Неверный логин или пароль");
        Map<String, String> response = exceptionHandler.handleBadCredentialsException(ex);

        assertEquals("Неверный логин или пароль", response.get("message"));
    }

    @Test
    @DisplayName("handleSecurityException возвращает текст ошибки доступа")
    void handleSecurityException() {
        SecurityException ex = new SecurityException("Доступ запрещен");
        Map<String, String> response = exceptionHandler.handleSecurityException(ex);

        assertEquals("Доступ запрещен", response.get("message"));
    }

    @Test
    @DisplayName("handleIllegalArgumentException возвращает текст ошибки бизнес-логики")
    void handleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Вы не можете купить свой товар");
        Map<String, String> response = exceptionHandler.handleIllegalArgumentException(ex);

        assertEquals("Вы не можете купить свой товар", response.get("message"));
    }

    @Test
    @DisplayName("handleValidationExceptions парсит ошибки полей в Map")
    void handleValidationExceptions() {
        Object target = new Object();
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(target, "target");
        bindingResult.addError(new FieldError("target", "email", "Некорректный email"));
        bindingResult.addError(new FieldError("target", "password", "Пароль не может быть пустым"));

        BindException bindException = new BindException(bindingResult);

        Map<String, String> errors = exceptionHandler.handleValidationExceptions(bindException);

        assertEquals(2, errors.size());
        assertEquals("Некорректный email", errors.get("email"));
        assertEquals("Пароль не может быть пустым", errors.get("password"));
    }
}