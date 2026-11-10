package com.example.marketplace.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

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
    @NotBlank(message = "Введите название")
    @Size(min = 3, max = 100, message = "Длина должна быть от 3 до 100 символов")
    private String title;

    @Column(name = "description", length = 2000)
    @Size(max = 2000, message = "Описание слишком длинное")
    private String description;

    @Column(nullable = false)
    @NotNull(message = "Введите цену")
    @Positive(message = "Цена должна быть больше 0")
    private BigDecimal price;

    @Column(nullable = false)
    @NotBlank(message = "Введите город")
    @Size(min = 3, max = 50, message = "Длина должна быть от 3 до 50 символов")
    private String city;

    private Long previewImageId;

    private LocalDateTime createdAt;

    @Column(name = "is_sold", nullable = false)
    private boolean isSold = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    @JsonIgnore
    private User seller;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "product")
    private List<Image> images = new ArrayList<>();

    @PrePersist
    private void init() {
        createdAt = LocalDateTime.now();
    }

    public Product() {}

    public Product(Long id, String title, String description, BigDecimal price, Long previewImageId, LocalDateTime createdAt, List<Image> images, String city, boolean isSold, User seller) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.previewImageId = previewImageId;
        this.createdAt = createdAt;
        this.images = images;
        this.city = city;
        this.isSold = isSold;
        this.seller = seller;
    }

    public void addImage(Image image) {
        images.add(image);
        image.setProduct(this);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public Long getPreviewImageId() {
        return previewImageId;
    }

    public void setPreviewImageId(Long previewImageId) {
        this.previewImageId = previewImageId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isSold() {
        return isSold;
    }

    public void setSold(boolean sold) {
        this.isSold = sold;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }
}