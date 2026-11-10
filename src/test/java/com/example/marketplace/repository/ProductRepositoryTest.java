package com.example.marketplace.repository;

import com.example.marketplace.entity.Product;
import com.example.marketplace.entity.Role;
import com.example.marketplace.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class ProductRepositoryTest {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private TestEntityManager entityManager;

    private User seller;

    @Autowired
    private OrderRepository orderRepository;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
        productRepository.deleteAll();

        seller = new User();
        seller.setNickName("seller_pro_" + System.currentTimeMillis());
        seller.setEmail("seller_pro_" + System.currentTimeMillis() + "@marketplace.by");
        seller.setPassword("hashed_pass");
        seller.setActive(true);
        seller.setRole(Role.ROLE_USER);
        seller = entityManager.persistAndFlush(seller);
    }

    private Product createProduct(String title, String desc, BigDecimal price, String city, boolean isSold, LocalDateTime createdAt) {
        Product product = new Product();
        product.setTitle(title);
        product.setDescription(desc);
        product.setPrice(price);
        product.setCity(city);
        product.setSold(isSold);
        product.setSeller(seller);
        product.setCreatedAt(createdAt);
        return entityManager.persistAndFlush(product);
    }

    @Test
    @DisplayName("findByCityIgnoreCase находит товары независимо от регистра названия города")
    void findByCityIgnoreCase_Success() {
        createProduct("Item 1", "Desc 1", new BigDecimal("100"), "Minsk", false, LocalDateTime.now());
        createProduct("Item 2", "Desc 2", new BigDecimal("200"), "Grodno", false, LocalDateTime.now());

        List<Product> results = productRepository.findByCityIgnoreCase("mInSK");

        assertEquals(1, results.size());
        assertEquals("Item 1", results.get(0).getTitle());
    }

    @Test
    @DisplayName("searchByKeyword ищет подстроку и в названии, и в описании")
    void searchByKeyword_SearchesTitleAndDescription() {
        createProduct("Vintage Cargo Pants", "Classic cut", new BigDecimal("150"), "Minsk", false, LocalDateTime.now());
        createProduct("Black Hoodie", "Features cargo pocket on sleeve", new BigDecimal("90"), "Brest", false, LocalDateTime.now());
        createProduct("Leather Belt", "Pure leather", new BigDecimal("40"), "Minsk", false, LocalDateTime.now());

        List<Product> results = productRepository.searchByKeyword("cargo");

        assertEquals(2, results.size());
    }

    @Test
    @DisplayName("searchByKeywordAndCity фильтрует совпадения по тексту и городу")
    void searchByKeywordAndCity_FiltersBoth() {
        createProduct("Vintage Cargo Pants", "Classic", new BigDecimal("150"), "Minsk", false, LocalDateTime.now());
        createProduct("Cargo Shorts", "Summer", new BigDecimal("100"), "Grodno", false, LocalDateTime.now());

        List<Product> results = productRepository.searchByKeywordAndCity("cargo", "minsk");

        assertEquals(1, results.size());
        assertEquals("Vintage Cargo Pants", results.get(0).getTitle());
    }

    @Test
    @DisplayName("findByIsSoldFalseOrderByCreatedAtDesc возвращает только непроданные товары от новых к старым")
    void findByIsSoldFalseOrderByCreatedAtDesc_ReturnsOnlyActiveSorted() {
        LocalDateTime now = LocalDateTime.now();
        createProduct("Old Active", "Desc", new BigDecimal("50"), "Minsk", false, now.minusDays(2));
        createProduct("New Active", "Desc", new BigDecimal("70"), "Minsk", false, now);
        createProduct("Sold Out", "Desc", new BigDecimal("99"), "Minsk", true, now.minusDays(1));

        List<Product> results = productRepository.findByIsSoldFalseOrderByCreatedAtDesc();

        assertEquals(2, results.size());
        assertEquals("New Active", results.get(0).getTitle());
        assertEquals("Old Active", results.get(1).getTitle());
    }

    @Test
    @DisplayName("findBySeller_IdOrderByCreatedAtDesc возвращает товары конкретного продавца с сортировкой")
    void findBySeller_IdOrderByCreatedAtDesc_FiltersBySeller() {
        LocalDateTime now = LocalDateTime.now();
        createProduct("Item 1", "Desc", new BigDecimal("50"), "Minsk", false, now.minusHours(1));
        createProduct("Item 2", "Desc", new BigDecimal("70"), "Minsk", false, now);

        User anotherSeller = new User();
        anotherSeller.setNickName("other_seller");
        anotherSeller.setEmail("other@marketplace.by");
        anotherSeller.setPassword("hash");
        anotherSeller.setActive(true);
        anotherSeller.setRole(Role.ROLE_USER);
        anotherSeller = entityManager.persistAndFlush(anotherSeller);

        Product otherProduct = new Product();
        otherProduct.setTitle("Other Item");
        otherProduct.setPrice(new BigDecimal("30"));
        otherProduct.setCity("Minsk");
        otherProduct.setSeller(anotherSeller);
        otherProduct.setCreatedAt(now);
        entityManager.persistAndFlush(otherProduct);

        List<Product> sellerProducts = productRepository.findBySeller_IdOrderByCreatedAtDesc(seller.getId());

        assertEquals(2, sellerProducts.size());
        assertEquals("Item 2", sellerProducts.get(0).getTitle());
    }

    @Test
    @DisplayName("findByTitleContainingIgnoreCase с пагинацией делит выборку на страницы")
    void findByTitleContainingIgnoreCase_Pagination() {
        createProduct("Archive Jacket", "Desc", new BigDecimal("200"), "Minsk", false, LocalDateTime.now());
        createProduct("Archive Boots", "Desc", new BigDecimal("180"), "Minsk", false, LocalDateTime.now());
        createProduct("Archive Cap", "Desc", new BigDecimal("40"), "Minsk", false, LocalDateTime.now());

        Page<Product> page = productRepository.findByTitleContainingIgnoreCase("archive", PageRequest.of(0, 2));

        assertEquals(2, page.getContent().size());
        assertEquals(3, page.getTotalElements());
        assertEquals(2, page.getTotalPages());
    }
}