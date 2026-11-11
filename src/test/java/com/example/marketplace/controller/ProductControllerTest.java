package com.example.marketplace.controller;

import com.example.marketplace.dto.ProductResponse;
import com.example.marketplace.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private ProductService productService;

    @Test
    @DisplayName("GET /api/products возвращает список товаров без параметров")
    void getAllProducts_ReturnsList() throws Exception {
        ProductResponse item = new ProductResponse(
                1L, "Test Title", "Test Desc", new BigDecimal("100.00"),
                "Minsk", 10L, List.of(10L), false, "seller_nick", LocalDateTime.now()
        );

        when(productService.getAllProducts(null, null)).thenReturn(List.of(item));

        mockMvc.perform(get("/api/products"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Test Title"))
                .andExpect(jsonPath("$[0].city").value("Minsk"))
                .andExpect(jsonPath("$[0].imageIds[0]").value(10L));
    }

    @Test
    @DisplayName("GET /api/products с параметрами keyword и city фильтрует товары")
    void getAllProducts_WithParams_ReturnsFilteredList() throws Exception {
        ProductResponse item = new ProductResponse(
                2L, "Archive Bomber", "Rare jacket", new BigDecimal("300.00"),
                "Гродно", 12L, List.of(12L), false, "seller_nick", LocalDateTime.now()
        );

        when(productService.getAllProducts(eq("bomber"), eq("Гродно")))
                .thenReturn(List.of(item));

        mockMvc.perform(get("/api/products")
                        .param("keyword", "bomber")
                        .param("city", "Гродно"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].title").value("Archive Bomber"))
                .andExpect(jsonPath("$[0].city").value("Гродно"));
    }

    @Test
    @WithMockUser
    @DisplayName("Успешное создание товара через multipart/form-data")
    void createProduct_Success() throws Exception {
        ProductResponse response = new ProductResponse(
                1L, "Bomber Jacket", "Nice jacket", new BigDecimal("250.00"),
                "Minsk", null, List.of(), false, "seller_nick", LocalDateTime.now());

        when(productService.createProduct(
                eq("Bomber Jacket"), eq("Nice jacket"), eq(new BigDecimal("250.00")),
                eq("Minsk"), any(), any()
        )).thenReturn(response);

        mockMvc.perform(multipart("/api/products")
                        .param("title", "Bomber Jacket")
                        .param("description", "Nice jacket")
                        .param("price", "250.00")
                        .param("city", "Minsk"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.title").value("Bomber Jacket"));
    }

    @Test
    @WithMockUser
    @DisplayName("Создание товара без обязательного параметра price возвращает 400 Bad Request")
    void createProduct_MissingPrice_ReturnsBadRequest() throws Exception {
        mockMvc.perform(multipart("/api/products")
                        .param("title", "No Price Item")
                        .param("city", "Minsk"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    @DisplayName("Создание товара без обязательного параметра title возвращает 400 Bad Request")
    void createProduct_MissingTitle_ReturnsBadRequest() throws Exception {
        mockMvc.perform(multipart("/api/products")
                        .param("price", "120.00")
                        .param("city", "Minsk"))
                .andExpect(status().isBadRequest());
    }
}