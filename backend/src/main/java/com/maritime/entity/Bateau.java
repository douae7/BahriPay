package com.maritime.entity;

import com.maritime.enums.VesselStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "bateaux")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bateau {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(nullable = false, unique = true, length = 60)
    private String registration;

    @Column(name = "vessel_type", nullable = false, length = 100)
    private String type;

    @Column(name = "capacity_kg", nullable = false)
    private int capacityKg;

    @Column(name = "engine_power_hp", nullable = false)
    private int enginePowerHp;

    @Column(name = "length_meters", nullable = false, precision = 5, scale = 2)
    private BigDecimal lengthMeters;

    @Column(name = "home_port", nullable = false, length = 120)
    private String homePort;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private VesselStatus status = VesselStatus.DISPONIBLE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "captain_id")
    private Marin captain;

    @Column(name = "last_maintenance_date")
    private LocalDate lastMaintenanceDate;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
