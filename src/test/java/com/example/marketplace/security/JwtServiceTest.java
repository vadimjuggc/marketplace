package com.example.marketplace.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtServiceTest {

    private JwtService jwtService;

    private final String secret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
    private final long expiration = 86400000L; // 24 часа

    @BeforeEach
    void setUp() {
        jwtService = new JwtService();
        ReflectionTestUtils.setField(jwtService, "secretKey", secret);
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", expiration);
    }

    @Test
    @DisplayName("Успешная генерация токена и извлечение userId")
    void generateToken_And_ExtractUserId_Success() {
        Long userId = 42L;
        String email = "test@marketplace.by";
        String role = "ROLE_USER";

        String token = jwtService.generateToken(userId, email, role);

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertEquals(userId, jwtService.extractUserId(token));
    }

    @Test
    @DisplayName("isTokenValid возвращает true для корректного токена")
    void isTokenValid_ValidToken_ReturnsTrue() {
        String token = jwtService.generateToken(1L, "user@marketplace.by", "ROLE_USER");

        assertTrue(jwtService.isTokenValid(token));
    }

    @Test
    @DisplayName("isTokenValid возвращает false для искаженного токена")
    void isTokenValid_TamperedToken_ReturnsFalse() {
        String token = jwtService.generateToken(1L, "user@marketplace.by", "ROLE_USER");
        String tamperedToken = token + "xyz";

        assertFalse(jwtService.isTokenValid(tamperedToken));
    }

    @Test
    @DisplayName("isTokenValid возвращает false для мусорной строки или null")
    void isTokenValid_InvalidString_ReturnsFalse() {
        assertFalse(jwtService.isTokenValid("invalid.token.string"));
        assertFalse(jwtService.isTokenValid(null));
    }
}