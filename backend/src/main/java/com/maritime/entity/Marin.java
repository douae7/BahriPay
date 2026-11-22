package com.maritime.entity;

import com.maritime.enums.SailorStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "marins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Marin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", nullable = false, unique = true, length = 60)
    private String registrationNumber;

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(nullable = false, length = 40)
    private String phone;

    @Column(nullable = false, length = 180)
    private String email;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "grade_id", nullable = false)
    private Grade grade;

    @Column(name = "share_weight", nullable = false, precision = 5, scale = 2)
    private BigDecimal shareWeight;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private SailorStatus status = SailorStatus.ACTIF;

    @Column(name = "port_attache", nullable = false, length = 120)
    private String portAttache;

    @Column(name = "years_experience", nullable = false)
    @Builder.Default
    private int yearsExperience = 1;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bateau_id")
    private Bateau bateau;

    @OneToMany(mappedBy = "marin", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Contrat> contrats = new ArrayList<>();

    @OneToMany(mappedBy = "marin", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Absence> absences = new ArrayList<>();

    @OneToMany(mappedBy = "marin", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<DocumentAdministratif> documents = new ArrayList<>();
}
