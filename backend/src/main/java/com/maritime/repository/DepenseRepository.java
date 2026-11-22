package com.maritime.repository;

import com.maritime.entity.Depense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;

public interface DepenseRepository extends JpaRepository<Depense, Long> {
    List<Depense> findAllByOrderByExpenseDateDesc();
    List<Depense> findBySortieId(Long sortieId);

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Depense d")
    BigDecimal sumTotalExpenses();

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Depense d WHERE d.sortie.id = :sortieId")
    BigDecimal sumExpensesBySortieId(@Param("sortieId") Long sortieId);

    @Query("SELECT COALESCE(SUM(d.amount), 0) FROM Depense d WHERE d.bateau.id = :bateauId")
    BigDecimal sumExpensesByBateauId(@Param("bateauId") Long bateauId);
}
