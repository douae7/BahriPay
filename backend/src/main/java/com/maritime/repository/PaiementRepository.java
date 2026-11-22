package com.maritime.repository;

import com.maritime.entity.Paiement;
import com.maritime.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;

public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    List<Paiement> findAllByOrderByCreatedAtDesc();
    boolean existsBySortieId(Long sortieId);
    long countByStatus(PaymentStatus status);

    @Query("SELECT COALESCE(SUM(p.amountDue), 0) FROM Paiement p WHERE p.status = 'EN_ATTENTE'")
    BigDecimal sumPendingAmount();
}
