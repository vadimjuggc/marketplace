package com.example.marketplace.repository;

import com.example.marketplace.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByIsSoldFalseOrderByCreatedAtDesc();

    List<Product> findBySeller_IdOrderByCreatedAtDesc(Long sellerId);

    Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Query("""
        SELECT p FROM Product p
        WHERE p.isSold = false
          AND (:city IS NULL OR :city = '' OR LOWER(p.city) = LOWER(:city))
          AND (:keyword IS NULL OR :keyword = '' OR 
               LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR 
               LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%')))
        ORDER BY p.createdAt DESC
    """)
    List<Product> searchProducts(@Param("keyword") String keyword, @Param("city") String city);

    List<Product> findBySeller_IdAndIsSoldFalseOrderByCreatedAtDesc(Long sellerId);
}