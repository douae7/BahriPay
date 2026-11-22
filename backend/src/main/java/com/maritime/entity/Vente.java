package com.maritime.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "ventes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vente {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sortie_id")
    private SortiePeche sortie;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bateau_id", nullable = false)
    private Bateau bateau;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "espece_id", nullable = false)
    private EspecePoisson espece;

    @Column(name = "sale_date", nullable = false)
    private LocalDate saleDate;

    @Column(nullable = false, length = 150)
    private String buyer;

    @Column(name = "quantity_kg", nullable = false, precision = 10, scale = 2)
    private BigDecimal quantityKg;

    @Column(name = "price_per_kg", nullable = false, precision = 8, scale = 2)
    private BigDecimal pricePerKg;

    @Column(name = "total_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalAmount;
}
