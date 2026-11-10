package com.example.marketplace.repository;

import com.example.marketplace.entity.Order;
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
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@ActiveProfiles("test")
class OrderRepositoryTest {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private TestEntityManager entityManager;

    @BeforeEach
    void setUp() {
        orderRepository.deleteAll();
    }

    @Test
    @DisplayName("findByBuyer_IdOrderByCreatedAtDesc возвращает историю заказов конкретного покупателя")
    void findByBuyer_IdOrderByCreatedAtDesc_ReturnsSortedOrders() {
        User seller = new User();
        seller.setNickName("seller_unit");
        seller.setEmail("seller_unit@test.by");
        seller.setPassword("pass");
        seller.setActive(true);
        seller.setRole(Role.ROLE_USER);
        seller = entityManager.persistAndFlush(seller);

        User buyer1 = new User();
        buyer1.setNickName("buyer_one");
        buyer1.setEmail("buyer1@test.by");
        buyer1.setPassword("pass");
        buyer1.setActive(true);
        buyer1.setRole(Role.ROLE_USER);
        buyer1 = entityManager.persistAndFlush(buyer1);

        User buyer2 = new User();
        buyer2.setNickName("buyer_two");
        buyer2.setEmail("buyer2@test.by");
        buyer2.setPassword("pass");
        buyer2.setActive(true);
        buyer2.setRole(Role.ROLE_USER);
        buyer2 = entityManager.persistAndFlush(buyer2);

        Product p1 = new Product();
        p1.setTitle("Product 1");
        p1.setPrice(new BigDecimal("100"));
        p1.setCity("Minsk");
        p1.setSeller(seller);
        p1 = entityManager.persistAndFlush(p1);

        Product p2 = new Product();
        p2.setTitle("Product 2");
        p2.setPrice(new BigDecimal("200"));
        p2.setCity("Minsk");
        p2.setSeller(seller);
        p2 = entityManager.persistAndFlush(p2);

        LocalDateTime now = LocalDateTime.now();

        Order orderOld = new Order();
        orderOld.setProduct(p1);
        orderOld.setBuyer(buyer1);
        orderOld.setPrice(p1.getPrice());
        orderOld.setCreatedAt(now.minusDays(1));
        entityManager.persistAndFlush(orderOld);

        Order orderNew = new Order();
        orderNew.setProduct(p2);
        orderNew.setBuyer(buyer1);
        orderNew.setPrice(p2.getPrice());
        orderNew.setCreatedAt(now);
        entityManager.persistAndFlush(orderNew);

        Order orderOther = new Order();
        orderOther.setProduct(p1);
        orderOther.setBuyer(buyer2);
        orderOther.setPrice(p1.getPrice());
        orderOther.setCreatedAt(now);
        entityManager.persistAndFlush(orderOther);

        List<Order> orders = orderRepository.findByBuyer_IdOrderByCreatedAtDesc(buyer1.getId());

        assertEquals(2, orders.size());
        assertEquals(orderNew.getId(), orders.get(0).getId(), "Сначала должен идти более свежий заказ");
        assertEquals(orderOld.getId(), orders.get(1).getId());
    }
}