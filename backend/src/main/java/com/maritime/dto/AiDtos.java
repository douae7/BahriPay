package com.maritime.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public final class AiDtos {

    private AiDtos() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AiAskRequest {
        @NotBlank(message = "La question est obligatoire.")
        private String question;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AiHighlightDto {
        private String label;
        private String value;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ForecastPointDto {
        private String month;
        private BigDecimal historique;
        private BigDecimal prevision;
        private boolean isPrediction;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AiAskResponse {
        private String answer;
        private boolean isPrediction;
        private boolean sufficientData;
        private int historicalTripsCount;
        private String sourceMode;
        private String timestamp;
        private List<AiHighlightDto> highlights;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AiRecommendationDto {
        private String title;
        private String detail;
        private boolean basedOnActualData;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class AiAnalysisResponse {
        private boolean sufficientData;
        private String statusMessage;
        private int historicalTripsCount;
        private int historicalSalesCount;
        private BigDecimal predictedNextMonthCatchKg;
        private BigDecimal predictedNextMonthRevenue;
        private BigDecimal actualTotalRevenue;
        private BigDecimal actualNetProfit;
        private List<DashboardDtos.VesselProfitabilityDto> vesselProfitability;
        private List<ForecastPointDto> forecastSeries;
        private List<AiRecommendationDto> recommendations;
        private String geminiIntegrationStatus;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PredictionHistoryDto {
        private Long id;
        private String analysisType;
        private String promptQuestion;
        private String answerSummary;
        private BigDecimal predictedCatchKg;
        private BigDecimal predictedRevenue;
        private boolean sufficientData;
        private boolean isPrediction;
        private String modelName;
        private String createdAt;
    }
}
