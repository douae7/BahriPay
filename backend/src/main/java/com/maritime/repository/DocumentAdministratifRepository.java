package com.maritime.repository;

import com.maritime.entity.DocumentAdministratif;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DocumentAdministratifRepository extends JpaRepository<DocumentAdministratif, Long> {
    List<DocumentAdministratif> findByMarinIdOrderByUploadedAtDesc(Long marinId);
}
