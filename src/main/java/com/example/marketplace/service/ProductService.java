package com.example.marketplace.service;

import com.example.marketplace.dto.ProductResponse;
import com.example.marketplace.entity.Image;
import com.example.marketplace.entity.Product;
import com.example.marketplace.entity.User;
import com.example.marketplace.exception.ResourceNotFoundException;
import com.example.marketplace.repository.ImageRepository;
import com.example.marketplace.repository.ProductRepository;
import com.example.marketplace.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final ImageRepository imageRepository;

    public ProductService(ProductRepository productRepository,
                          UserRepository userRepository,
                          ImageRepository imageRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findByIsSoldFalseOrderByCreatedAtDesc()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Товар с id " + id + " не найден"));
        return mapToResponse(product);
    }

    @Transactional
    public ProductResponse createProduct(String title, String description, BigDecimal price, String city,
                                         MultipartFile file, Long userId) throws IOException {
        User seller = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        Product product = new Product();
        product.setTitle(title);
        product.setCity(city);
        product.setDescription(description);
        product.setPrice(price);
        product.setSeller(seller);
        product.setSold(false);

        Product savedProduct = productRepository.save(product);

        if (file != null && !file.isEmpty()) {
            Image image = new Image();
            image.setName(file.getName());
            image.setOriginalFileName(file.getOriginalFilename());
            image.setContentType(file.getContentType());
            image.setSize(file.getSize());
            image.setBytes(file.getBytes());
            image.setProduct(savedProduct);

            Image savedImage = imageRepository.save(image);
            savedProduct.setPreviewImageId(savedImage.getId());
            savedProduct = productRepository.save(savedProduct);
        }

        return mapToResponse(savedProduct);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getMyProducts(Long userId) {
        return productRepository.findBySeller_IdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public void deleteProduct(Long productId, Long userId) {
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Товар не найден"));

        if (!product.getSeller().getId().equals(userId)) {
            throw new IllegalArgumentException("Вы не можете удалить чужой товар");
        }

        if (product.isSold()) {
            throw new IllegalStateException("Нельзя удалить уже проданный товар");
        }

        productRepository.delete(product);
    }

    private ProductResponse mapToResponse(Product product) {
        return new ProductResponse(
                product.getId(),
                product.getTitle(),
                product.getDescription(),
                product.getPrice(),
                product.getCity(),
                product.getPreviewImageId(),
                product.isSold(),
                product.getSeller() != null ? product.getSeller().getNickName() : "Unknown",
                product.getCreatedAt()
        );
    }
}