package com.maritime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "regles_repartition")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegleRepartition {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "rule_name", nullable = false, length = 120)
    private String ruleName;

    @Column(name = "boat_share_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal boatSharePercent;

    @Column(name = "crew_share_percent", nullable = false, precision = 5, scale = 2)
    private BigDecimal crewSharePercent;

    @Column(name = "deduct_common_expenses_before_split", nullable = false)
    private boolean deductCommonExpensesBeforeSplit;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @Column(name = "updated_by_email", length = 180)
    private String updatedByEmail;
}
