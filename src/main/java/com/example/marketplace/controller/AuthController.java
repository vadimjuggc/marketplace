package com.example.marketplace.controller;

import com.example.marketplace.dto.AuthResponse;
import com.example.marketplace.dto.LoginRequest;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.UserAlreadyExistsException;
import com.example.marketplace.service.JwtService;
import com.example.marketplace.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).build();
        }
        catch (UserAlreadyExistsException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
            User user = userService.login(loginRequest.identifier(), loginRequest.password());
            String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            return ResponseEntity.ok(new AuthResponse(token, user.getNickName(), user.getRole().name()));
    }


}
