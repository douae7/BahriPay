package com.maritime.repository;

import com.maritime.entity.Bateau;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BateauRepository extends JpaRepository<Bateau, Long> {
    Optional<Bateau> findByRegistrationIgnoreCase(String registration);
    boolean existsByRegistrationIgnoreCase(String registration);
}
