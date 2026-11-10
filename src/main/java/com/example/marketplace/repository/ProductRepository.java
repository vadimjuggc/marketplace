package com.example.marketplace.repository;

import com.example.marketplace.entity.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByCityIgnoreCase(String city);

    @Query("SELECT p FROM Product p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Product> searchByKeyword(@Param("keyword") String keyword);

    @Query("SELECT p FROM Product p WHERE " +
            "(LOWER(p.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            " LOWER(p.description) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
            "LOWER(p.city) = LOWER(:city)")
    List<Product> searchByKeywordAndCity(@Param("keyword") String keyword, @Param("city") String city);

    Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    List<Product> findByIsSoldFalseOrderByCreatedAtDesc();

    List<Product> findBySeller_IdOrderByCreatedAtDesc(Long sellerId);
}
