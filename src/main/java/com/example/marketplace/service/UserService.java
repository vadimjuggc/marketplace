package com.example.marketplace.service;

import com.example.marketplace.entity.Role;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.UserAlreadyExistsException;
import com.example.marketplace.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private UserRepository userRepository;

    public UserService(PasswordEncoder passwordEncoder) {
        this.passwordEncoder = passwordEncoder;
    }

    public void createUser(User user) {
        if (userRepository.existsByNickName(user.getNickName())) {
            throw new UserAlreadyExistsException("user with this nickname is already exists");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("user with this email is already exists");
        }
            String encodedPassword = passwordEncoder.encode(user.getPassword());
            user.setPassword(encodedPassword);
            user.setActive(true);
            user.setRole(Role.ROLE_USER);
            userRepository.save(user);
    }
}
