package com.example.marketplace.service;

import com.example.marketplace.dto.CreateOrderRequest;
import com.example.marketplace.dto.OrderResponse;
import com.example.marketplace.entity.Order;
import com.example.marketplace.entity.Product;
import com.example.marketplace.entity.User;
import com.example.marketplace.repository.OrderRepository;
import com.example.marketplace.repository.ProductRepository;
import com.example.marketplace.repository.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private OrderService orderService;

    @Test
    @DisplayName("Успешное создание заказа: товар помечается проданным")
    void createOrder_Success() {
        Long buyerId = 20L;
        Long sellerId = 10L;
        Long productId = 1L;

        User buyer = new User();
        buyer.setId(buyerId);

        User seller = new User();
        seller.setId(sellerId);

        Product product = new Product();
        product.setId(productId);
        product.setSeller(seller);
        product.setPrice(BigDecimal.valueOf(100));
        product.setSold(false);

        CreateOrderRequest request = new CreateOrderRequest(productId);

        when(userRepository.findById(buyerId)).thenReturn(Optional.of(buyer));
        when(productRepository.findByIdForUpdate(productId)).thenReturn(Optional.of(product));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.createOrder(request, buyerId);

        assertNotNull(response);
        assertTrue(product.isSold());
        verify(orderRepository, times(1)).save(any(Order.class));
    }

    @Test
    @DisplayName("Попытка купить свой собственный товар выбрасывает исключение")
    void createOrder_BuyOwnProduct_ThrowsException() {
        Long userId = 10L;
        Long productId = 1L;

        User user = new User();
        user.setId(userId);

        Product product = new Product();
        product.setId(productId);
        product.setSeller(user);
        product.setSold(false);

        CreateOrderRequest request = new CreateOrderRequest(productId);

        when(productRepository.findByIdForUpdate(productId)).thenReturn(Optional.of(product));

        assertThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrder(request, userId)
        );

        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Попытка купить уже проданный товар выбрасывает исключение")
    void createOrder_ProductAlreadySold_ThrowsException() {
        Long buyerId = 20L;
        Long sellerId = 10L;
        Long productId = 1L;

        User seller = new User();
        seller.setId(sellerId);

        Product product = new Product();
        product.setId(productId);
        product.setSeller(seller);
        product.setSold(true);

        CreateOrderRequest request = new CreateOrderRequest(productId);

        when(productRepository.findByIdForUpdate(productId)).thenReturn(Optional.of(product));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> orderService.createOrder(request, buyerId)
        );

        assertEquals("Товар уже продан", exception.getMessage());
        verify(orderRepository, never()).save(any());
    }
}