package com.maritime.repository;

import com.maritime.entity.RegleRepartition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RegleRepartitionRepository extends JpaRepository<RegleRepartition, Long> {
    Optional<RegleRepartition> findFirstByActiveTrueOrderByUpdatedAtDesc();
}
