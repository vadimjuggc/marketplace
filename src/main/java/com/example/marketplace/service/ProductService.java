package com.example.marketplace.service;

import com.example.marketplace.dto.ProductResponse;
import com.example.marketplace.entity.Image;
import com.example.marketplace.entity.Product;
import com.example.marketplace.entity.User;
import com.example.marketplace.repository.ProductRepository;
import com.example.marketplace.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ProductService(ProductRepository productRepository, UserRepository userRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    public List<Product> listProducts(String keyword, String city) {
        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasCity = city != null && !city.isBlank();

        if (hasKeyword && hasCity) {
            return productRepository.searchByKeywordAndCity(keyword.trim(), city.trim());
        }
        if (hasKeyword) {
            return productRepository.searchByKeyword(keyword.trim());
        }
        if (hasCity) {
            return productRepository.findByCityIgnoreCase(city.trim());
        }
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Product with id " + id + " not found"));
    }

    @Transactional
    public void saveProduct(Long userId, Product product, MultipartFile... files) throws IOException {
        User user = userRepository.findById(userId).orElseThrow(() -> new EntityNotFoundException("User with id " + userId + " not found"));
        product.setUser(user);

        if (files != null) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    Image image = toImageEntity(file);
                    if (product.getImages() != null && product.getImages().isEmpty()) {
                        image.setPreviewImage(true);
                    }
                    product.addImage(image);
                }
            }
        }

        Product savedProduct = productRepository.save(product);

        if (savedProduct.getImages() != null && !savedProduct.getImages().isEmpty()) {
            savedProduct.setPreviewImageId(savedProduct.getImages().get(0).getId());
            productRepository.save(savedProduct);
        }
    }

    @Transactional
    public void deleteProduct(Long productId, Long userId) {
        Product product = getProductById(productId);

        if (product.getUser() == null || !product.getUser().getId().equals(userId)) {
            throw new SecurityException("У вас нет прав на удаление этого товара");
        }
        productRepository.deleteById(productId);
    }

    private Image toImageEntity(MultipartFile file) throws IOException {
        Image image = new Image();
        image.setName(file.getName());
        image.setOriginalFileName(file.getOriginalFilename());
        image.setContentType(file.getContentType());
        image.setSize(file.getSize());
        image.setBytes(file.getBytes());
        return image;
    }

    public Page<ProductResponse> getProducts(String title, Pageable pageable) {
        Page<Product> products;
        if (title != null && !title.isBlank()) {
            products = productRepository.findByTitleContainingIgnoreCase(title, pageable);
        } else {
            products = productRepository.findAll(pageable);
        }

        return products.map(product -> new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getCity(),
                product.getPreviewImageId(),
                product.getUser() != null ? product.getUser().getNickName() : "Unknown",
                product.getCreatedAt()));
    }
}
