package com.example.marketplace.service;

import com.example.marketplace.entity.Role;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.UserAlreadyExistsException;
import com.example.marketplace.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final PasswordEncoder passwordEncoder;
    private UserRepository userRepository;

    public UserService(PasswordEncoder passwordEncoder, UserRepository userRepository) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
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

    public User login(String identifier, String password) {
        User user = userRepository.findByEmailOrNickName(identifier, identifier).orElseThrow(() -> new BadCredentialsException("Wrong login or password"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Wrong login or password");
        }
        return user;
    }
}
