package com.example.marketplace.controller;

import com.example.marketplace.dto.LoginRequest;
import com.example.marketplace.dto.RegisterRequest;
import com.example.marketplace.entity.Role;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.UserAlreadyExistsException;
import com.example.marketplace.security.JwtService;
import com.example.marketplace.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private UserService userService;

    @MockitoBean
    private JwtService jwtService;

    @Test
    @DisplayName("POST /api/auth/register — успешная регистрация возвращает 201 Created")
    void register_Success_ReturnsCreated() throws Exception {
        RegisterRequest request = new RegisterRequest("vadim_test", "vadim@example.com", "Password123!");

        doNothing().when(userService).createUser(any(User.class));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated());

        verify(userService, times(1)).createUser(any(User.class));
    }

    @Test
    @DisplayName("POST /api/auth/register — дубликат никнейма или почты возвращает 409")
    void register_DuplicateUser_ReturnsConflict() throws Exception {
        RegisterRequest request = new RegisterRequest("existing_user", "taken@example.com", "Password123!");

        doThrow(new UserAlreadyExistsException("user with this nickname is already exists"))
                .when(userService).createUser(any(User.class));

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("user with this nickname is already exists"));
    }

    @Test
    @DisplayName("POST /api/auth/login — успешный вход возвращает 200 OK, JWT-токен и данные профиля")
    void login_Success_ReturnsAuthResponse() throws Exception {
        LoginRequest request = new LoginRequest("vadim@example.com", "Password123!");

        User mockUser = new User();
        mockUser.setId(1L);
        mockUser.setNickName("vadim_test");
        mockUser.setEmail("vadim@example.com");
        mockUser.setRole(Role.ROLE_USER);

        when(userService.login("vadim@example.com", "Password123!")).thenReturn(mockUser);
        when(jwtService.generateToken(1L, "vadim@example.com", "ROLE_USER")).thenReturn("mocked.jwt.token");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mocked.jwt.token"))
                .andExpect(jsonPath("$.nickName").value("vadim_test"))
                .andExpect(jsonPath("$.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("POST /api/auth/login — неверный логин или пароль возвращает 401 Unauthorized")
    void login_InvalidCredentials_ReturnsUnauthorized() throws Exception {
        LoginRequest request = new LoginRequest("vadim@example.com", "WrongPassword");

        when(userService.login("vadim@example.com", "WrongPassword"))
                .thenThrow(new BadCredentialsException("Wrong login or password"));

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}