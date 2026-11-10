package com.example.marketplace.controller;

import com.example.marketplace.dto.ProductResponse;
import com.example.marketplace.service.ProductService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<ProductResponse>> getAllProducts() {
        return ResponseEntity.ok(productService.getAllProducts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getProductById(id));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductResponse> createProduct(@RequestParam("title") String title,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("price") BigDecimal price, @RequestParam("city") String city,
            @RequestParam(value = "image", required = false) MultipartFile image,
            @AuthenticationPrincipal Long userId) throws IOException {

        ProductResponse response = productService.createProduct(title, description, price, city, image, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/my")
    public ResponseEntity<List<ProductResponse>> getMyProducts(@AuthenticationPrincipal Long userId) {
        return ResponseEntity.ok(productService.getMyProducts(userId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, @AuthenticationPrincipal Long userId) {
        productService.deleteProduct(id, userId);
        return ResponseEntity.noContent().build();
    }
}