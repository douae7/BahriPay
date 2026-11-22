package com.maritime.entity;

import com.maritime.enums.TripStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "sorties_peche")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SortiePeche {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bateau_id", nullable = false)
    private Bateau bateau;

    @Column(name = "departure_date", nullable = false)
    private LocalDateTime departureDate;

    @Column(name = "return_date")
    private LocalDateTime returnDate;

    @Column(nullable = false, length = 180)
    private String zone;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private TripStatus status = TripStatus.PLANIFIEE;

    @Column(name = "total_catch_kg", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal totalCatchKg = BigDecimal.ZERO;

    @Column(name = "estimated_revenue", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal estimatedRevenue = BigDecimal.ZERO;

    @Column(length = 600)
    private String notes;

    @OneToMany(mappedBy = "sortie", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Equipage> equipages = new ArrayList<>();

    @OneToMany(mappedBy = "sortie", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ProductionPeche> productions = new ArrayList<>();
}
