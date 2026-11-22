package com.maritime.repository;

import com.maritime.entity.EspecePoisson;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface EspecePoissonRepository extends JpaRepository<EspecePoisson, Long> {
    Optional<EspecePoisson> findByNameIgnoreCase(String name);
    Optional<EspecePoisson> findByCodeIgnoreCase(String code);
}
