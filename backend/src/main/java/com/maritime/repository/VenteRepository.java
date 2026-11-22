package com.maritime.repository;

import com.maritime.entity.Vente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface VenteRepository extends JpaRepository<Vente, Long> {
    List<Vente> findAllByOrderBySaleDateDesc();
    List<Vente> findBySortieId(Long sortieId);

    @Query("SELECT COALESCE(SUM(v.totalAmount), 0) FROM Vente v")
    BigDecimal sumTotalRevenue();

    @Query("SELECT COALESCE(SUM(v.totalAmount), 0) FROM Vente v WHERE v.sortie.id = :sortieId")
    BigDecimal sumRevenueBySortieId(@Param("sortieId") Long sortieId);

    @Query("SELECT COALESCE(SUM(v.totalAmount), 0) FROM Vente v WHERE v.bateau.id = :bateauId")
    BigDecimal sumRevenueByBateauId(@Param("bateauId") Long bateauId);
}
