package com.example.marketplace.service;

import com.example.marketplace.entity.Role;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.UserAlreadyExistsException;
import com.example.marketplace.mapper.ProductMapper;
import com.example.marketplace.repository.ProductRepository;
import com.example.marketplace.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private UserService userService;

    @Test
    @DisplayName("Успешная регистрация: пароль хешируется, роль ROLE_USER, юзер активен")
    void createUser_Success() {
        User user = new User();
        user.setNickName("archive_enthusiast");
        user.setEmail("user@example.com");
        user.setPassword("rawPassword123");

        when(userRepository.existsByNickName("archive_enthusiast")).thenReturn(false);
        when(userRepository.existsByEmail("user@example.com")).thenReturn(false);
        when(passwordEncoder.encode("rawPassword123")).thenReturn("hashedPasswordXYZ");

        userService.createUser(user);

        assertEquals("hashedPasswordXYZ", user.getPassword());
        assertTrue(user.isActive());
        assertEquals(Role.ROLE_USER, user.getRole());
        verify(userRepository).save(user);
    }

    @Test
    @DisplayName("Регистрация с занятым никнеймом выбрасывает UserAlreadyExistsException")
    void createUser_DuplicateNickname_ThrowsException() {
        User user = new User();
        user.setNickName("taken_nick");

        when(userRepository.existsByNickName("taken_nick")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> userService.createUser(user));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Регистрация с занятым email выбрасывает UserAlreadyExistsException")
    void createUser_DuplicateEmail_ThrowsException() {
        User user = new User();
        user.setNickName("free_nick");
        user.setEmail("taken@example.com");

        when(userRepository.existsByNickName("free_nick")).thenReturn(false);
        when(userRepository.existsByEmail("taken@example.com")).thenReturn(true);

        assertThrows(UserAlreadyExistsException.class, () -> userService.createUser(user));
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Успешный логин по существующему логину и правильному паролю")
    void login_Success() {
        String identifier = "user@example.com";
        String rawPassword = "correctPassword";
        String encodedPassword = "encodedHash";

        User existingUser = new User();
        existingUser.setEmail(identifier);
        existingUser.setPassword(encodedPassword);

        when(userRepository.findByEmailOrNickName(identifier, identifier))
                .thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches(rawPassword, encodedPassword)).thenReturn(true);

        User loggedInUser = userService.login(identifier, rawPassword);

        assertNotNull(loggedInUser);
        assertEquals(identifier, loggedInUser.getEmail());
    }

    @Test
    @DisplayName("Логин с несуществующим пользователем выбрасывает BadCredentialsException")
    void login_UserNotFound_ThrowsBadCredentialsException() {
        String identifier = "unknown_user";

        when(userRepository.findByEmailOrNickName(identifier, identifier))
                .thenReturn(Optional.empty());

        assertThrows(BadCredentialsException.class, () -> userService.login(identifier, "anyPassword"));
    }

    @Test
    @DisplayName("Логин с неверным паролем выбрасывает BadCredentialsException")
    void login_WrongPassword_ThrowsBadCredentialsException() {
        String identifier = "user@example.com";
        User existingUser = new User();
        existingUser.setPassword("correctHash");

        when(userRepository.findByEmailOrNickName(identifier, identifier))
                .thenReturn(Optional.of(existingUser));
        when(passwordEncoder.matches("wrongPassword", "correctHash")).thenReturn(false);

        assertThrows(BadCredentialsException.class, () -> userService.login(identifier, "wrongPassword"));
    }
}