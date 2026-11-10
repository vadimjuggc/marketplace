package com.example.marketplace.controller;

import com.example.marketplace.dto.CreateOrderRequest;
import com.example.marketplace.dto.OrderResponse;
import com.example.marketplace.entity.OrderStatus;
import com.example.marketplace.service.OrderService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class OrderControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private OrderService orderService;

    @InjectMocks
    private OrderController orderController;

    private final Long testUserId = 10L;

    @BeforeEach
    void setUp() {
        HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class)
                        && parameter.getParameterType().equals(Long.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter,
                                          ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest,
                                          WebDataBinderFactory binderFactory) {
                return testUserId;
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(orderController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .build();
    }

    @Test
    @DisplayName("POST /api/orders успешно создаёт заказ (201 Created)")
    void createOrder_Returns201() throws Exception {
        CreateOrderRequest request = new CreateOrderRequest(5L);
        OrderResponse mockResponse = new OrderResponse(
                1L,
                5L,
                "hoodie raw",
                BigDecimal.valueOf(235),
                OrderStatus.CREATED,
                LocalDateTime.now()
        );

        when(orderService.createOrder(any(CreateOrderRequest.class), eq(testUserId))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.orderId").value(1))
                .andExpect(jsonPath("$.productTitle").value("hoodie raw"))
                .andExpect(jsonPath("$.price").value(235));
    }

    @Test
    @DisplayName("GET /api/orders/my возвращает список заказов пользователя (200 OK)")
    void getMyOrders_Returns200() throws Exception {
        OrderResponse mockOrder = new OrderResponse(
                1L,
                5L,
                "hoodie raw",
                BigDecimal.valueOf(235),
                OrderStatus.CREATED,
                LocalDateTime.now()
        );

        when(orderService.getUserOrders(testUserId)).thenReturn(List.of(mockOrder));

        mockMvc.perform(get("/api/orders/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].productTitle").value("hoodie raw"))
                .andExpect(jsonPath("$[0].price").value(235));
    }
}