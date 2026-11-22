package com.maritime.entity;

import com.maritime.enums.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "paiements",
        uniqueConstraints = @UniqueConstraint(name = "uk_paiement_sortie_marin", columnNames = {"sortie_id", "marin_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sortie_id", nullable = false)
    private SortiePeche sortie;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "marin_id", nullable = false)
    private Marin marin;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "regle_id", nullable = false)
    private RegleRepartition regle;

    @Column(name = "period_label", nullable = false, length = 120)
    private String periodLabel;

    @Column(name = "gross_trip_revenue", nullable = false, precision = 12, scale = 2)
    private BigDecimal grossTripRevenue;

    @Column(name = "common_expenses", nullable = false, precision = 12, scale = 2)
    private BigDecimal commonExpenses;

    @Column(name = "net_distributable", nullable = false, precision = 12, scale = 2)
    private BigDecimal netDistributable;

    @Column(name = "crew_pool_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal crewPoolAmount;

    @Column(name = "sailor_weight", nullable = false, precision = 5, scale = 2)
    private BigDecimal sailorWeight;

    @Column(name = "total_crew_weights", nullable = false, precision = 7, scale = 2)
    private BigDecimal totalCrewWeights;

    @Column(name = "amount_due", nullable = false, precision = 12, scale = 2)
    private BigDecimal amountDue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private PaymentStatus status = PaymentStatus.EN_ATTENTE;

    @Column(name = "paid_at")
    private LocalDate paidAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "paiement", cascade = CascadeType.ALL, orphanRemoval = true)
    private FichePaiement fichePaiement;
}
