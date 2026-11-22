package com.maritime.repository;

import com.maritime.entity.FichePaiement;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FichePaiementRepository extends JpaRepository<FichePaiement, Long> {
    Optional<FichePaiement> findByPaiementId(Long paiementId);
}
