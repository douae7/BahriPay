package com.maritime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "fiches_paiement")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FichePaiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "reference_number", nullable = false, unique = true, length = 60)
    private String referenceNumber;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "paiement_id", nullable = false, unique = true)
    private Paiement paiement;

    @Column(name = "generated_at", nullable = false)
    @Builder.Default
    private LocalDateTime generatedAt = LocalDateTime.now();

    @Column(name = "boat_share_percent_snapshot", nullable = false, precision = 5, scale = 2)
    private BigDecimal boatSharePercentSnapshot;

    @Column(name = "crew_share_percent_snapshot", nullable = false, precision = 5, scale = 2)
    private BigDecimal crewSharePercentSnapshot;

    @Column(name = "expenses_deducted", nullable = false)
    private boolean expensesDeducted;

    @Column(name = "breakdown_json", columnDefinition = "TEXT")
    private String breakdownJson;

    @Column(name = "issuer_name", length = 150)
    private String issuerName;

    @Column(length = 400)
    private String remarks;
}
