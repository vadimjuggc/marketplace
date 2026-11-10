package com.example.marketplace.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(unique = true)
    private String nickName;

    @NotBlank
    @Column(unique = true)
    private String email;

    private LocalDateTime createdAt;

    private boolean active;

    @NotBlank
    private String password;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "seller")
    private List<Product> products;

    @Enumerated(EnumType.STRING)
    private Role role;

    public User() {}

    @PrePersist
    private void init() {
        createdAt = LocalDateTime.now();
    }

    public User(Long id, String nickName, String email, LocalDateTime createdAt, boolean active, String password, List<Product> products, Role role) {
        this.id = id;
        this.nickName = nickName;
        this.email = email;
        this.createdAt = createdAt;
        this.active = active;
        this.password = password;
        this.products = products;
        this.role = role;
    }

    public Long getId() {
        return id;
    }

    public String getNickName() {
        return nickName;
    }

    public String getEmail() {
        return email;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isActive() {
        return active;
    }

    public String getPassword() {
        return password;
    }

    public List<Product> getProducts() {
        return products;
    }

    public Role getRole() {
        return role;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setNickName(String nickName) {
        this.nickName = nickName;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
