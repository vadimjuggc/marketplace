package com.example.marketplace.controller;

import com.example.marketplace.dto.UserPublicResponse;
import com.example.marketplace.exception.ResourceNotFoundException;
import com.example.marketplace.security.JwtAuthenticationFilter;
import com.example.marketplace.security.JwtService;
import com.example.marketplace.service.UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(UserController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @MockitoBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /api/users/{nickName} возвращает 200 OK и данные профиля продавца")
    void getSellerProfile_Success() throws Exception {
        String nickName = "archive_dealer";
        String email = "dealer@stash.by";
        UserPublicResponse response = new UserPublicResponse(
                1L,
                nickName,
                email,
                LocalDateTime.now(),
                Collections.emptyList()
        );

        when(userService.getSellerProfile(nickName)).thenReturn(response);

        mockMvc.perform(get("/api/users/{nickName}", nickName)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.nickName").value(nickName))
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    @DisplayName("GET /api/users/{nickName} возвращает 404 Not Found, если пользователь не найден")
    void getSellerProfile_NotFound() throws Exception {
        String nickName = "ghost_user";

        when(userService.getSellerProfile(nickName))
                .thenThrow(new ResourceNotFoundException("Пользователь не найден"));

        mockMvc.perform(get("/api/users/{nickName}", nickName)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.message").value("Пользователь не найден"));
    }
}