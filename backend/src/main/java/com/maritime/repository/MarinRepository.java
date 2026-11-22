package com.maritime.repository;

import com.maritime.entity.Marin;
import com.maritime.enums.SailorStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface MarinRepository extends JpaRepository<Marin, Long> {
    Optional<Marin> findByRegistrationNumberIgnoreCase(String registrationNumber);
    boolean existsByRegistrationNumberIgnoreCase(String registrationNumber);

    @Query("""
        SELECT DISTINCT m FROM Marin m
        LEFT JOIN FETCH m.grade g
        LEFT JOIN FETCH m.bateau b
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(CONCAT(m.firstName, ' ', m.lastName)) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(m.registrationNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(m.portAttache) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:gradeLabel IS NULL OR :gradeLabel = '' OR LOWER(g.label) = LOWER(:gradeLabel) OR LOWER(g.code) = LOWER(:gradeLabel))
          AND (:status IS NULL OR m.status = :status)
        ORDER BY m.id DESC
        """)
    List<Marin> searchFiltered(
            @Param("search") String search,
            @Param("gradeLabel") String gradeLabel,
            @Param("status") SailorStatus status
    );
}
