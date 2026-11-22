package com.maritime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "especes_poisson")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EspecePoisson {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 30)
    private String code;

    @Column(nullable = false, unique = true, length = 100)
    private String name;

    @Column(name = "scientific_name", length = 120)
    private String scientificName;

    @Column(name = "default_price_per_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal defaultPricePerKg;

    @Column(length = 80)
    private String category;
}
