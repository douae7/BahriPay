package com.maritime.service.impl;

import com.maritime.dto.DashboardDtos;
import com.maritime.entity.*;
import com.maritime.enums.PaymentStatus;
import com.maritime.enums.TripStatus;
import com.maritime.enums.VesselStatus;
import com.maritime.repository.*;
import com.maritime.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.TextStyle;
import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final Locale FR_LOCALE = Locale.FRENCH;

    private final MarinRepository marinRepository;
    private final BateauRepository bateauRepository;
    private final SortiePecheRepository sortieRepository;
    private final VenteRepository venteRepository;
    private final DepenseRepository depenseRepository;
    private final PaiementRepository paiementRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardDtos.DashboardSummaryResponse getDashboardSummary() {
        BigDecimal totalRevenue = safe(venteRepository.sumTotalRevenue());
        BigDecimal totalExpenses = safe(depenseRepository.sumTotalExpenses());
        BigDecimal totalCatchKg = safe(sortieRepository.sumTotalCatchKg());
        BigDecimal pendingAmount = safe(paiementRepository.sumPendingAmount());

        DashboardDtos.KpiSummaryDto kpis = DashboardDtos.KpiSummaryDto.builder()
                .totalSailors(marinRepository.count())
                .totalVessels(bateauRepository.count())
                .totalTrips(sortieRepository.count())
                .totalCatchKg(totalCatchKg)
                .totalRevenue(totalRevenue)
                .totalExpenses(totalExpenses)
                .netProfit(totalRevenue.subtract(totalExpenses))
                .pendingPaymentsAmount(pendingAmount)
                .pendingPaymentsCount(paiementRepository.countByStatus(PaymentStatus.EN_ATTENTE))
                .activeTripsCount(sortieRepository.countByStatus(TripStatus.EN_COURS))
                .vesselsAtSeaCount(bateauRepository.findAll().stream()
                        .filter(b -> b.getStatus() == VesselStatus.EN_MER)
                        .count())
                .build();

        return DashboardDtos.DashboardSummaryResponse.builder()
                .kpis(kpis)
                .monthlySeries(getMonthlyStats())
                .vesselProfitability(getVesselProfitability())
                .speciesPerformance(computeSpeciesPerformance())
                .recentActivities(computeRecentActivities())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardDtos.MonthlyStatDto> getMonthlyStats() {
        List<Vente> ventes = venteRepository.findAll();
        List<Depense> depenses = depenseRepository.findAll();
        List<SortiePeche> sorties = sortieRepository.findAll();

        YearMonth latestDataMonth = YearMonth.now();
        for (Vente v : ventes) {
            YearMonth ym = YearMonth.from(v.getSaleDate());
            if (ym.isAfter(latestDataMonth)) latestDataMonth = ym;
        }
        for (Depense d : depenses) {
            YearMonth ym = YearMonth.from(d.getExpenseDate());
            if (ym.isAfter(latestDataMonth)) latestDataMonth = ym;
        }
        for (SortiePeche s : sorties) {
            YearMonth ym = YearMonth.from(s.getDepartureDate());
            if (ym.isAfter(latestDataMonth)) latestDataMonth = ym;
        }

        YearMonth startMonth = latestDataMonth.minusMonths(11);

        Map<YearMonth, BigDecimal> revByMonth = new LinkedHashMap<>();
        Map<YearMonth, BigDecimal> expByMonth = new LinkedHashMap<>();
        Map<YearMonth, BigDecimal> catchByMonth = new LinkedHashMap<>();

        for (int i = 0; i < 12; i++) {
            YearMonth ym = startMonth.plusMonths(i);
            revByMonth.put(ym, BigDecimal.ZERO);
            expByMonth.put(ym, BigDecimal.ZERO);
            catchByMonth.put(ym, BigDecimal.ZERO);
        }

        for (Vente v : ventes) {
            YearMonth ym = YearMonth.from(v.getSaleDate());
            if (revByMonth.containsKey(ym)) {
                revByMonth.put(ym, revByMonth.get(ym).add(safe(v.getTotalAmount())));
            }
        }

        for (Depense d : depenses) {
            YearMonth ym = YearMonth.from(d.getExpenseDate());
            if (expByMonth.containsKey(ym)) {
                expByMonth.put(ym, expByMonth.get(ym).add(safe(d.getAmount())));
            }
        }

        for (SortiePeche s : sorties) {
            YearMonth ym = YearMonth.from(s.getDepartureDate());
            if (catchByMonth.containsKey(ym)) {
                catchByMonth.put(ym, catchByMonth.get(ym).add(safe(s.getTotalCatchKg())));
            }
        }

        List<DashboardDtos.MonthlyStatDto> result = new ArrayList<>();
        for (YearMonth ym : revByMonth.keySet()) {
            BigDecimal rec = revByMonth.get(ym);
            BigDecimal dep = expByMonth.get(ym);
            String shortMonth = capitalize(ym.getMonth().getDisplayName(TextStyle.SHORT, FR_LOCALE).replace(".", ""));
            result.add(DashboardDtos.MonthlyStatDto.builder()
                    .month(shortMonth + " " + String.valueOf(ym.getYear()).substring(2))
                    .recettes(rec)
                    .depenses(dep)
                    .benefice(rec.subtract(dep))
                    .captureKg(catchByMonth.get(ym))
                    .build());
        }
        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<DashboardDtos.VesselProfitabilityDto> getVesselProfitability() {
        List<Bateau> vessels = bateauRepository.findAll();
        List<SortiePeche> allTrips = sortieRepository.findAll();

        return vessels.stream().map(b -> {
            BigDecimal rev = safe(venteRepository.sumRevenueByBateauId(b.getId()));
            BigDecimal exp = safe(depenseRepository.sumExpensesByBateauId(b.getId()));
            BigDecimal profit = rev.subtract(exp);
            int margin = rev.compareTo(BigDecimal.ZERO) > 0
                    ? profit.multiply(new BigDecimal("100")).divide(rev, 0, RoundingMode.HALF_UP).intValue()
                    : 0;
            long tripsCount = allTrips.stream().filter(t -> t.getBateau().getId().equals(b.getId())).count();

            return DashboardDtos.VesselProfitabilityDto.builder()
                    .vesselId(b.getId())
                    .vesselName(b.getName())
                    .registration(b.getRegistration())
                    .homePort(b.getHomePort())
                    .status(b.getStatus().getLabel())
                    .revenue(rev)
                    .expenses(exp)
                    .netProfit(profit)
                    .marginPercent(margin)
                    .tripsCount(tripsCount)
                    .build();
        }).sorted(Comparator.comparing(DashboardDtos.VesselProfitabilityDto::getNetProfit).reversed()).toList();
    }

    private List<DashboardDtos.SpeciesPerformanceDto> computeSpeciesPerformance() {
        Map<String, BigDecimal> kgBySpecies = new LinkedHashMap<>();
        Map<String, BigDecimal> revBySpecies = new LinkedHashMap<>();

        for (Vente v : venteRepository.findAll()) {
            String name = v.getEspece().getName();
            kgBySpecies.merge(name, safe(v.getQuantityKg()), BigDecimal::add);
            revBySpecies.merge(name, safe(v.getTotalAmount()), BigDecimal::add);
        }

        return kgBySpecies.keySet().stream()
                .map(name -> DashboardDtos.SpeciesPerformanceDto.builder()
                        .species(name)
                        .totalKg(kgBySpecies.get(name))
                        .totalRevenue(revBySpecies.get(name))
                        .build())
                .sorted(Comparator.comparing(DashboardDtos.SpeciesPerformanceDto::getTotalRevenue).reversed())
                .toList();
    }

    private List<DashboardDtos.RecentActivityDto> computeRecentActivities() {
        List<DashboardDtos.RecentActivityDto> items = new ArrayList<>();

        venteRepository.findAllByOrderBySaleDateDesc().stream().limit(4).forEach(v ->
                items.add(DashboardDtos.RecentActivityDto.builder()
                        .type("VENTE")
                        .title("Vente " + v.getEspece().getName() + " · " + v.getBuyer())
                        .subtitle(v.getBateau().getName() + " — " + v.getQuantityKg() + " kg")
                        .date(v.getSaleDate().toString())
                        .amount(v.getTotalAmount())
                        .build())
        );

        depenseRepository.findAllByOrderByExpenseDateDesc().stream().limit(3).forEach(d ->
                items.add(DashboardDtos.RecentActivityDto.builder()
                        .type("DEPENSE")
                        .title(d.getCategory().getLabel() + " · " + d.getBateau().getName())
                        .subtitle(d.getDescription())
                        .date(d.getExpenseDate().toString())
                        .amount(d.getAmount().negate())
                        .build())
        );

        sortieRepository.findAllByOrderByDepartureDateDesc().stream().limit(3).forEach(s ->
                items.add(DashboardDtos.RecentActivityDto.builder()
                        .type("SORTIE")
                        .title("Sortie " + s.getCode() + " · " + s.getBateau().getName())
                        .subtitle(s.getZone() + " (" + s.getStatus().getLabel() + ")")
                        .date(LocalDate.from(s.getDepartureDate()).toString())
                        .amount(s.getEstimatedRevenue())
                        .build())
        );

        items.sort(Comparator.comparing(DashboardDtos.RecentActivityDto::getDate).reversed());
        return items.stream().limit(8).toList();
    }

    private BigDecimal safe(BigDecimal val) {
        return val != null ? val : BigDecimal.ZERO;
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return "";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
