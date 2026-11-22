package com.maritime.repository;

import com.maritime.entity.Grade;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GradeRepository extends JpaRepository<Grade, Long> {
    Optional<Grade> findByCodeIgnoreCase(String code);
    Optional<Grade> findByLabelIgnoreCase(String label);
}
