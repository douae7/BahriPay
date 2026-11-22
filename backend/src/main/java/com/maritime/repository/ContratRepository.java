package com.maritime.repository;

import com.maritime.entity.Contrat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContratRepository extends JpaRepository<Contrat, Long> {
    List<Contrat> findByMarinIdOrderByStartDateDesc(Long marinId);
}
