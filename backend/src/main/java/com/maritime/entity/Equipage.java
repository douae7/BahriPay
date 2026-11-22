package com.maritime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(
        name = "equipages",
        uniqueConstraints = @UniqueConstraint(name = "uk_equipage_sortie_marin", columnNames = {"sortie_id", "marin_id"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Equipage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "sortie_id", nullable = false)
    private SortiePeche sortie;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "marin_id", nullable = false)
    private Marin marin;

    @Column(name = "role_at_sea", length = 80)
    private String roleAtSea;

    @Column(name = "share_weight_snapshot", nullable = false, precision = 5, scale = 2)
    private BigDecimal shareWeightSnapshot;
}
