package com.example.marketplace.service;

import com.example.marketplace.entity.Product;
import com.example.marketplace.entity.User;
import com.example.marketplace.mapper.ProductMapper;
import com.example.marketplace.repository.ImageRepository;
import com.example.marketplace.repository.ProductRepository;
import com.example.marketplace.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ImageRepository imageRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private ProductService productService;

    @Test
    @DisplayName("Успешное удаление своего непроданного товара")
    void deleteProduct_Success() {
        Long productId = 1L;
        Long userId = 10L;

        User seller = new User();
        seller.setId(userId);

        Product product = new Product();
        product.setId(productId);
        product.setSeller(seller);
        product.setSold(false);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        assertDoesNotThrow(() -> productService.deleteProduct(productId, userId));

        verify(productRepository, times(1)).delete(product);
    }

    @Test
    @DisplayName("Ошибка при попытке удалить чужой товар (403 / IllegalArgumentException)")
    void deleteProduct_ForeignProduct_ThrowsException() {
        Long productId = 1L;
        Long currentUserId = 10L;
        Long anotherUserId = 99L;

        User foreignSeller = new User();
        foreignSeller.setId(anotherUserId);

        Product product = new Product();
        product.setId(productId);
        product.setSeller(foreignSeller);
        product.setSold(false);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> productService.deleteProduct(productId, currentUserId)
        );

        assertEquals("Вы не можете удалить чужой товар", exception.getMessage());
        verify(productRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Ошибка при попытке удалить уже проданный товар (400 / IllegalStateException)")
    void deleteProduct_AlreadySold_ThrowsException() {
        Long productId = 1L;
        Long userId = 10L;

        User seller = new User();
        seller.setId(userId);

        Product product = new Product();
        product.setId(productId);
        product.setSeller(seller);
        product.setSold(true);

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));

        IllegalStateException exception = assertThrows(
                IllegalStateException.class,
                () -> productService.deleteProduct(productId, userId)
        );

        assertEquals("Нельзя удалить уже проданный товар", exception.getMessage());
        verify(productRepository, never()).delete(any());
    }
}