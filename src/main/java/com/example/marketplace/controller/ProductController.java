package com.example.marketplace.controller;

import com.example.marketplace.entity.Product;
import com.example.marketplace.service.ProductService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<List<Product>> getProductList(@RequestParam(required = false) String keyword, @RequestParam(required = false) String city) {
        return ResponseEntity.ok(productService.listProducts(keyword, city));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Product> getProductById(@PathVariable Long id){
        try {
            return ResponseEntity.ok(productService.getProductById(id));
        }
        catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }



}
