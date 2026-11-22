package com.maritime.service;

import com.maritime.dto.DashboardDtos;

import java.util.List;

public interface DashboardService {
    DashboardDtos.DashboardSummaryResponse getDashboardSummary();
    List<DashboardDtos.MonthlyStatDto> getMonthlyStats();
    List<DashboardDtos.VesselProfitabilityDto> getVesselProfitability();
}
