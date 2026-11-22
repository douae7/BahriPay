package com.maritime.dto;

import com.maritime.enums.ExpenseCategory;
import com.maritime.enums.PaymentStatus;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

public final class FinanceDtos {

    private FinanceDtos() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VenteRequest {
        private Long tripId;
        @NotNull(message = "Le navire est obligatoire.")
        private Long vesselId;
        private LocalDate date;
        private Long speciesId;
        @NotBlank(message = "L'espèce est obligatoire.")
        private String species;
        @NotBlank(message = "L'acheteur ou la criée est obligatoire.")
        private String buyer;
        @NotNull @DecimalMin("0.1")
        private BigDecimal quantityKg;
        @NotNull @DecimalMin("0.1")
        private BigDecimal pricePerKg;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VenteResponse {
        private Long id;
        private Long tripId;
        private Long vesselId;
        private String vesselName;
        private LocalDate date;
        private String species;
        private String buyer;
        private BigDecimal quantityKg;
        private BigDecimal pricePerKg;
        private BigDecimal totalAmount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DepenseRequest {
        private Long tripId;
        @NotNull(message = "Le navire est obligatoire.")
        private Long vesselId;
        private LocalDate date;
        @NotNull(message = "La catégorie est obligatoire.")
        private ExpenseCategory category;
        @NotBlank(message = "Le libellé est obligatoire.")
        private String description;
        @NotNull @DecimalMin("0.01")
        private BigDecimal amount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DepenseResponse {
        private Long id;
        private Long tripId;
        private Long vesselId;
        private String vesselName;
        private LocalDate date;
        private ExpenseCategory category;
        private String description;
        private BigDecimal amount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RegleRepartitionDto {
        private Long id;
        private String ruleName;
        @NotNull @DecimalMin("10.0") @DecimalMax("90.0")
        private BigDecimal boatSharePercent;
        @NotNull @DecimalMin("10.0") @DecimalMax("90.0")
        private BigDecimal crewSharePercent;
        private boolean deductCommonExpensesBeforeSplit;
        private String updatedAt;
        private String updatedByEmail;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaiementResponse {
        private Long id;
        private Long sailorId;
        private String sailorName;
        private String sailorGrade;
        private Long tripId;
        private String periodLabel;
        private BigDecimal grossTripRevenue;
        private BigDecimal commonExpenses;
        private BigDecimal netDistributable;
        private BigDecimal crewPoolAmount;
        private BigDecimal sailorWeight;
        private BigDecimal totalCrewWeights;
        private BigDecimal amountDue;
        private PaymentStatus status;
        private LocalDate paidAt;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class FichePaiementResponse {
        private Long id;
        private String referenceNumber;
        private Long paymentId;
        private String sailorName;
        private String sailorRegistrationNumber;
        private String periodLabel;
        private BigDecimal boatSharePercentSnapshot;
        private BigDecimal crewSharePercentSnapshot;
        private boolean expensesDeducted;
        private BigDecimal grossTripRevenue;
        private BigDecimal commonExpenses;
        private BigDecimal netDistributable;
        private BigDecimal crewPoolAmount;
        private BigDecimal sailorWeight;
        private BigDecimal totalCrewWeights;
        private BigDecimal amountDue;
        private PaymentStatus status;
        private LocalDate paidAt;
        private String generatedAt;
        private String issuerName;
        private String remarks;
    }
}
