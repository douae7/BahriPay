package com.maritime.entity;

import com.maritime.enums.ExpenseCategory;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "depenses")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Depense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sortie_id")
    private SortiePeche sortie;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "bateau_id", nullable = false)
    private Bateau bateau;

    @Column(name = "expense_date", nullable = false)
    private LocalDate expenseDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ExpenseCategory category;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;
}
