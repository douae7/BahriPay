package com.maritime.repository;

import com.maritime.entity.SortiePeche;
import com.maritime.enums.TripStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface SortiePecheRepository extends JpaRepository<SortiePeche, Long> {
    Optional<SortiePeche> findByCodeIgnoreCase(String code);
    List<SortiePeche> findByStatusOrderByDepartureDateDesc(TripStatus status);
    List<SortiePeche> findAllByOrderByDepartureDateDesc();
    long countByStatus(TripStatus status);

    @Query("SELECT COALESCE(SUM(s.totalCatchKg), 0) FROM SortiePeche s")
    BigDecimal sumTotalCatchKg();
}
