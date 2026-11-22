package com.maritime.repository;

import com.maritime.entity.PredictionIA;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PredictionIARepository extends JpaRepository<PredictionIA, Long> {
    List<PredictionIA> findTop20ByOrderByCreatedAtDesc();
}
