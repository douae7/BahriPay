package com.maritime.dto;

import com.maritime.enums.TripStatus;
import com.maritime.enums.VesselStatus;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public final class FlotteDtos {

    private FlotteDtos() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BateauRequest {
        @NotBlank(message = "Le nom du navire est obligatoire.")
        private String name;

        @NotBlank(message = "L'immatriculation est obligatoire.")
        private String registration;

        @NotBlank(message = "Le type de navire est obligatoire.")
        private String type;

        @Positive(message = "La capacité doit être positive.")
        private int capacityKg;

        @Positive(message = "La puissance moteur doit être positive.")
        private int enginePowerHp;

        @NotNull
        @DecimalMin("3.0")
        private BigDecimal lengthMeters;

        @NotBlank(message = "Le port d'attache est obligatoire.")
        private String homePort;

        private VesselStatus status;
        private Long captainId;
        private LocalDate lastMaintenanceDate;
        private String imageUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BateauStatusRequest {
        @NotNull
        private VesselStatus status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class BateauResponse {
        private Long id;
        private String name;
        private String registration;
        private String type;
        private int capacityKg;
        private int enginePowerHp;
        private BigDecimal lengthMeters;
        private String homePort;
        private VesselStatus status;
        private Long captainId;
        private String captainName;
        private LocalDate lastMaintenanceDate;
        private String imageUrl;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class EspeceDto {
        private Long id;
        @NotBlank
        private String code;
        @NotBlank
        private String name;
        private String scientificName;
        @NotNull
        @DecimalMin("0.10")
        private BigDecimal defaultPricePerKg;
        private String category;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CatchInput {
        private Long speciesId;
        private String species;

        @NotNull
        @DecimalMin(value = "0.1", message = "La quantité doit être supérieure à 0.")
        private BigDecimal quantityKg;

        @NotNull
        @DecimalMin(value = "0.1", message = "Le prix au kg doit être supérieur à 0.")
        private BigDecimal pricePerKg;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductionDto {
        private Long id;
        private Long sortieId;
        private Long speciesId;
        private String species;
        private BigDecimal quantityKg;
        private BigDecimal pricePerKg;
        private BigDecimal totalValue;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ProductionCreateRequest {
        @NotNull
        private Long sortieId;
        private Long speciesId;
        private String species;
        @NotNull @DecimalMin("0.1")
        private BigDecimal quantityKg;
        @NotNull @DecimalMin("0.1")
        private BigDecimal pricePerKg;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SortieRequest {
        private String code;

        @NotNull(message = "Le navire est obligatoire.")
        private Long vesselId;

        private List<Long> crewIds;

        @NotNull(message = "La date de départ est obligatoire.")
        private LocalDateTime departureDate;

        private LocalDateTime returnDate;

        @NotBlank(message = "La zone de pêche est obligatoire.")
        private String zone;

        private TripStatus status;

        @Valid
        private List<CatchInput> catches;

        private String notes;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SortieStatusRequest {
        @NotNull
        private TripStatus status;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CrewAssignmentRequest {
        @NotEmpty
        private List<Long> crewIds;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SortieResponse {
        private Long id;
        private String code;
        private Long vesselId;
        private String vesselName;
        private List<Long> crewIds;
        private LocalDateTime departureDate;
        private LocalDateTime returnDate;
        private String zone;
        private TripStatus status;
        private List<ProductionDto> catches;
        private BigDecimal totalCatchKg;
        private BigDecimal estimatedRevenue;
        private String notes;
    }
}
