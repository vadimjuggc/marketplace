package com.example.marketplace.service;

import com.example.marketplace.dto.CreateOrderRequest;
import com.example.marketplace.dto.OrderResponse;
import com.example.marketplace.entity.Order;
import com.example.marketplace.entity.OrderStatus;
import com.example.marketplace.entity.Product;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.ResourceNotFoundException;
import com.example.marketplace.repository.OrderRepository;
import com.example.marketplace.repository.ProductRepository;
import com.example.marketplace.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public OrderService(OrderRepository orderRepository, ProductRepository productRepository, UserRepository userRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public OrderResponse createOrder(CreateOrderRequest request, Long userId) {
        Product product = productRepository.findByIdForUpdate(request.productId())
                .orElseThrow(() -> new ResourceNotFoundException("Товар не найден"));

        if (product.isSold()) {
            throw new IllegalArgumentException("Товар уже продан");
        }

        if (product.getSeller() != null && product.getSeller().getId().equals(userId)) {
            throw new IllegalArgumentException("Вы не можете купить собственный товар");
        }

        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        product.setSold(true);
        productRepository.save(product);

        Order order = new Order();
        order.setProduct(product);
        order.setBuyer(buyer);
        order.setPrice(product.getPrice());
        order.setStatus(OrderStatus.CREATED);

        Order savedOrder = orderRepository.save(order);

        return mapToResponse(savedOrder);
    }

    public OrderResponse mapToResponse(Order order) {
        return new OrderResponse(
                order.getId(),
                order.getProduct().getId(),
                order.getProduct().getTitle(),
                order.getPrice(),
                order.getStatus(),
                order.getCreatedAt()
        );
    }

    public List<OrderResponse> getUserOrders(Long userId){
        return orderRepository.findByBuyer_IdOrderByCreatedAtDesc(userId).stream().map(this::mapToResponse).toList();
    }
}
