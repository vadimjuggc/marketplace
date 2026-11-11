package com.example.marketplace.controller;

import com.example.marketplace.dto.UserPublicResponse;
import com.example.marketplace.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{nickName}")
    public ResponseEntity<UserPublicResponse> getSellerProfile(@PathVariable String nickName) {
        return ResponseEntity.ok(userService.getSellerProfile(nickName));
    }
}