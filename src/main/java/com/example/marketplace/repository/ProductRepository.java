package com.example.marketplace.repository;

import com.example.marketplace.entity.Product;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {

    List<Product> findByCityIgnoreCase(String city);

    List<Product> findByIsSoldFalseOrderByCreatedAtDesc();

    List<Product> findBySeller_IdOrderByCreatedAtDesc(Long sellerId);

    Page<Product> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM Product p WHERE p.id = :id")
    Optional<Product> findByIdForUpdate(@Param("id") Long id);

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