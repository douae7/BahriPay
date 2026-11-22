package com.maritime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "grades")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Grade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 40)
    private String code;

    @Column(nullable = false, unique = true, length = 80)
    private String label;

    @Column(name = "default_share_weight", nullable = false, precision = 5, scale = 2)
    private BigDecimal defaultShareWeight;

    @Column(length = 255)
    private String description;
}
