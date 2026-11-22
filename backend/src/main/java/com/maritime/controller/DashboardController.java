package com.maritime.controller;

import com.maritime.dto.DashboardDtos;
import com.maritime.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardDtos.DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getDashboardSummary());
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<DashboardDtos.MonthlyStatDto>> getMonthlyStats() {
        return ResponseEntity.ok(dashboardService.getMonthlyStats());
    }

    @GetMapping("/vessels")
    public ResponseEntity<List<DashboardDtos.VesselProfitabilityDto>> getVesselProfitability() {
        return ResponseEntity.ok(dashboardService.getVesselProfitability());
    }
}
