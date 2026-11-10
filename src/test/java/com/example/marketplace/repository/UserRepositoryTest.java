package com.example.marketplace.repository;

import com.example.marketplace.entity.Role;
import com.example.marketplace.entity.User;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.test.context.ActiveProfiles;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class UserRepositoryTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TestEntityManager entityManager;

    @Test
    @DisplayName("findByEmailOrNickName находит пользователя и по email, и по никнейму")
    void findByEmailOrNickName_Success() {
        User user = new User();
        user.setNickName("archive_seller");
        user.setEmail("seller@marketplace.by");
        user.setPassword("encoded_pass_123");
        user.setActive(true);
        user.setRole(Role.ROLE_USER);

        entityManager.persistAndFlush(user);

        Optional<User> foundByEmail = userRepository.findByEmailOrNickName("seller@marketplace.by", "seller@marketplace.by");
        assertTrue(foundByEmail.isPresent());
        assertEquals("archive_seller", foundByEmail.get().getNickName());

        Optional<User> foundByNick = userRepository.findByEmailOrNickName("archive_seller", "archive_seller");
        assertTrue(foundByNick.isPresent());
        assertEquals("seller@marketplace.by", foundByNick.get().getEmail());
    }

    @Test
    @DisplayName("existsByEmail и existsByNickName корректно определяют дубликаты")
    void existsChecks_ReturnTrueForExisting() {
        User user = new User();
        user.setNickName("unique_nick");
        user.setEmail("unique@marketplace.by");
        user.setPassword("pass");
        user.setActive(true);
        user.setRole(Role.ROLE_USER);

        entityManager.persistAndFlush(user);

        assertTrue(userRepository.existsByEmail("unique@marketplace.by"));
        assertTrue(userRepository.existsByNickName("unique_nick"));
        assertFalse(userRepository.existsByEmail("other@marketplace.by"));
        assertFalse(userRepository.existsByNickName("other_nick"));
    }
}