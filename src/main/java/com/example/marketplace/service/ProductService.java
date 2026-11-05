package com.example.marketplace.service;

import com.example.marketplace.entity.Image;
import com.example.marketplace.entity.Product;
import com.example.marketplace.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository productRepository;

    public ProductService(ProductRepository productRepository) {
        this.productRepository = productRepository;
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
    public void saveProduct(Product product, MultipartFile...files) throws IOException {
        if (files != null) {
            for (MultipartFile file : files) {
                if (file != null && !file.isEmpty()) {
                    Image image = toImageEntity(file);
                    if (product.getImages().isEmpty()) {
                        image.setPreviewImage(true);
                    }
                    product.addImage(image);
                }
            }
            Product savedProduct = productRepository.save(product);
            if (!savedProduct.getImages().isEmpty()) {
                savedProduct.setPreviewImageId(savedProduct.getImages().get(0).getId());
                productRepository.save(savedProduct);
            }
        }
    }

    @Transactional
    public void deleteProduct(Long id) {
        productRepository.deleteById(id);
    }

    private Image toImageEntity(MultipartFile file) throws IOException {
        Image image = new Image();
        image.setName(file.getName());
        image.setOriginalFileName(file.getOriginalFilename());
        image.setContentType(file.getContentType());
        image.setSize(file.getSize());
        image.setBytes(file.getBytes()); // достаёт массив байтов из потока
        return image;
    }
}
