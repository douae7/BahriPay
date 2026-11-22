package com.maritime.dto;

import com.maritime.enums.AbsenceType;
import com.maritime.enums.ContractType;
import com.maritime.enums.DocumentStatus;
import com.maritime.enums.SailorStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public final class MarinDtos {

    private MarinDtos() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MarinRequest {
        @NotBlank(message = "Le matricule ENIM est obligatoire.")
        private String registrationNumber;

        @NotBlank(message = "Le prénom est obligatoire.")
        private String firstName;

        @NotBlank(message = "Le nom est obligatoire.")
        private String lastName;

        @NotBlank(message = "Le téléphone est obligatoire.")
        private String phone;

        @NotBlank(message = "L'adresse e-mail est obligatoire.")
        @Email(message = "Adresse e-mail invalide.")
        private String email;

        @NotBlank(message = "Le grade est obligatoire.")
        private String grade;

        @DecimalMin(value = "0.25", message = "Le coefficient de part doit être positif.")
        private BigDecimal shareWeight;

        private SailorStatus status;

        private ContractType contractType;

        private LocalDate contractStart;

        private LocalDate contractEnd;

        private Long vesselId;

        @NotBlank(message = "Le port d'attache est obligatoire.")
        private String portAttache;

        @Min(0)
        private int yearsExperience;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MarinResponse {
        private Long id;
        private String registrationNumber;
        private String firstName;
        private String lastName;
        private String phone;
        private String email;
        private String grade;
        private BigDecimal shareWeight;
        private SailorStatus status;
        private ContractType contractType;
        private LocalDate contractStart;
        private LocalDate contractEnd;
        private Long vesselId;
        private String vesselName;
        private String portAttache;
        private int yearsExperience;
        private List<DocumentDto> documents;
        private List<AbsenceDto> absences;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GradeDto {
        private Long id;
        @NotBlank
        private String code;
        @NotBlank
        private String label;
        @NotNull
        @DecimalMin("0.25")
        private BigDecimal defaultShareWeight;
        private String description;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ContratRequest {
        @NotNull
        private Long marinId;
        @NotNull
        private ContractType contractType;
        @NotNull
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal customShareWeight;
        private boolean active = true;
        private String notes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ContratDto {
        private Long id;
        private Long marinId;
        private String marinFullName;
        private ContractType contractType;
        private LocalDate startDate;
        private LocalDate endDate;
        private BigDecimal customShareWeight;
        private boolean active;
        private String notes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AbsenceRequest {
        @NotNull
        private Long marinId;
        @NotNull
        private AbsenceType type;
        @NotNull
        private LocalDate startDate;
        @NotNull
        private LocalDate endDate;
        private Integer days;
        private String note;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AbsenceDto {
        private Long id;
        private Long marinId;
        private AbsenceType type;
        private LocalDate startDate;
        private LocalDate endDate;
        private int days;
        private String note;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DocumentRequest {
        @NotNull
        private Long marinId;
        @NotBlank
        private String name;
        private String documentType;
        private DocumentStatus status;
        private LocalDate expiryDate;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DocumentStatusUpdateRequest {
        @NotNull
        private DocumentStatus status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DocumentDto {
        private Long id;
        private Long marinId;
        private String name;
        private String documentType;
        private String fileName;
        private String contentType;
        private Long fileSize;
        private DocumentStatus status;
        private LocalDate expiryDate;
        private String uploadedAt;
    }
}
