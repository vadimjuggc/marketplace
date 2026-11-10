package com.example.marketplace.security;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityAccessTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Публичный каталог доступен без токена")
    void getPublicProducts_Unauthorized_ReturnsOk() throws Exception {
        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Попытка оформить заказ без токена возвращает 401 Unauthorized или 403 Forbidden")
    void createOrder_WithoutToken_ReturnsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"productId\": 1}"))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("Запрос с некорректным JWT токеном отклоняется")
    void requestWithInvalidToken_ReturnsForbidden() throws Exception {
        mockMvc.perform(get("/api/orders/my")
                        .header("Authorization", "Bearer invalid_malformed_token"))
                .andExpect(status().isForbidden());
    }
}