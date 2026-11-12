package com.example.marketplace.service;

import com.example.marketplace.dto.ProductResponse;
import com.example.marketplace.dto.UserPublicResponse;
import com.example.marketplace.entity.Role;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.ResourceNotFoundException;
import com.example.marketplace.exception.UserAlreadyExistsException;
import com.example.marketplace.mapper.ProductMapper;
import com.example.marketplace.repository.ProductRepository;
import com.example.marketplace.repository.UserRepository;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class UserService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductMapper productMapper;

    public UserService(PasswordEncoder passwordEncoder,
                       UserRepository userRepository,
                       ProductRepository productRepository,
                       ProductMapper productMapper) {
        this.passwordEncoder = passwordEncoder;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productMapper = productMapper;
    }

    public void createUser(User user) {
        if (userRepository.existsByNickName(user.getNickName())) {
            throw new UserAlreadyExistsException("Пользователь с таким именем уже существует");
        }
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new UserAlreadyExistsException("Пользователь с таким email уже существует");
        }
        String encodedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedPassword);
        user.setActive(true);
        user.setRole(Role.ROLE_USER);
        userRepository.save(user);
    }

    public User login(String identifier, String password) {
        User user = userRepository.findByEmailOrNickName(identifier, identifier)
                .orElseThrow(() -> new BadCredentialsException("Неверный логин или пароль"));
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BadCredentialsException("Неверный логин или пароль");
        }
        return user;
    }

    @Transactional(readOnly = true)
    public UserPublicResponse getSellerProfile(String nickName) {
        User seller = userRepository.findByNickName(nickName)
                .orElseThrow(() -> new ResourceNotFoundException("Продавец @" + nickName + " не найден"));

        List<ProductResponse> activeProducts = productRepository.findBySeller_IdAndIsSoldFalseOrderByCreatedAtDesc(seller.getId())
                .stream()
                .map(productMapper::toResponse)
                .toList();

        return new UserPublicResponse(
                seller.getId(),
                seller.getNickName(),
                seller.getEmail(),
                seller.getCreatedAt(),
                activeProducts
        );
    }
}