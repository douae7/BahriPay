package com.maritime.dto;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;

public final class DashboardDtos {

    private DashboardDtos() {}

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class KpiSummaryDto {
        private long totalSailors;
        private long totalVessels;
        private long totalTrips;
        private BigDecimal totalCatchKg;
        private BigDecimal totalRevenue;
        private BigDecimal totalExpenses;
        private BigDecimal netProfit;
        private BigDecimal pendingPaymentsAmount;
        private long pendingPaymentsCount;
        private long activeTripsCount;
        private long vesselsAtSeaCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyStatDto {
        private String month;
        private BigDecimal recettes;
        private BigDecimal depenses;
        private BigDecimal benefice;
        private BigDecimal captureKg;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class VesselProfitabilityDto {
        private Long vesselId;
        private String vesselName;
        private String registration;
        private String homePort;
        private String status;
        private BigDecimal revenue;
        private BigDecimal expenses;
        private BigDecimal netProfit;
        private int marginPercent;
        private long tripsCount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class SpeciesPerformanceDto {
        private String species;
        private BigDecimal totalKg;
        private BigDecimal totalRevenue;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecentActivityDto {
        private String type;
        private String title;
        private String subtitle;
        private String date;
        private BigDecimal amount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DashboardSummaryResponse {
        private KpiSummaryDto kpis;
        private List<MonthlyStatDto> monthlySeries;
        private List<VesselProfitabilityDto> vesselProfitability;
        private List<SpeciesPerformanceDto> speciesPerformance;
        private List<RecentActivityDto> recentActivities;
    }
}
