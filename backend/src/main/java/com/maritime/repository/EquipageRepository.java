package com.maritime.repository;

import com.maritime.entity.Equipage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EquipageRepository extends JpaRepository<Equipage, Long> {
    List<Equipage> findBySortieId(Long sortieId);
    void deleteBySortieId(Long sortieId);
}
