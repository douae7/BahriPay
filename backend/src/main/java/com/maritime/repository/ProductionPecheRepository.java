package com.maritime.repository;

import com.maritime.entity.ProductionPeche;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionPecheRepository extends JpaRepository<ProductionPeche, Long> {
    List<ProductionPeche> findBySortieId(Long sortieId);
}
