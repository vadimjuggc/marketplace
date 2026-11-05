package com.example.marketplace.entity;

import jakarta.persistence.*;
import org.springframework.data.annotation.Persistent;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "products")
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "text")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String city;

    private Long previewImageId;

    private LocalDateTime createdAt;

    @PrePersist
    private void init() {
        createdAt = LocalDateTime.now();
    }

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product")
    private List<Image> images = new ArrayList<>();

    public void addImage(Image image) {
        images.add(image);
        image.setProduct(this);
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Long getPreviewImageId() {
        return previewImageId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public List<Image> getImages() {
        return images;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public void setPreviewImageId(Long previewImageId) {
        this.previewImageId = previewImageId;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    public Product(Long id, String title, String description, BigDecimal price, Long previewImageId, LocalDateTime createdAt, List<Image> images) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.previewImageId = previewImageId;
        this.createdAt = createdAt;
        this.images = images;
    }

    public Product() {}
}
