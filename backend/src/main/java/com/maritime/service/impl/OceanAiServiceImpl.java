package com.maritime.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maritime.dto.AiDtos;
import com.maritime.dto.DashboardDtos;
import com.maritime.entity.Depense;
import com.maritime.entity.PredictionIA;
import com.maritime.entity.SortiePeche;
import com.maritime.entity.Vente;
import com.maritime.enums.TripStatus;
import com.maritime.repository.*;
import com.maritime.service.DashboardService;
import com.maritime.service.OceanAiService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class OceanAiServiceImpl implements OceanAiService {

    private static final int MIN_COMPLETED_TRIPS_FOR_PREDICTION = 2;
    private static final DateTimeFormatter TS_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    private final SortiePecheRepository sortieRepository;
    private final VenteRepository venteRepository;
    private final DepenseRepository depenseRepository;
    private final MarinRepository marinRepository;
    private final PredictionIARepository predictionRepository;
    private final DashboardService dashboardService;
    private final ObjectMapper objectMapper;

    @Value("${app.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.gemini.model:gemini-4-hydrogen}")
    private String geminiModel;

    @Value("${app.gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String geminiBaseUrl;

    @Override
    @Transactional
    public AiDtos.AiAnalysisResponse analyzeFleet() {
        List<SortiePeche> completedTrips = sortieRepository.findByStatusOrderByDepartureDateDesc(TripStatus.TERMINEE);
        List<Vente> allSales = venteRepository.findAllByOrderBySaleDateDesc();
        List<Depense> allExpenses = depenseRepository.findAllByOrderByExpenseDateDesc();

        BigDecimal actualRevenue = allSales.stream()
                .map(Vente::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actualExpenses = allExpenses.stream()
                .map(Depense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal actualProfit = actualRevenue.subtract(actualExpenses);

        List<DashboardDtos.VesselProfitabilityDto> profitability = dashboardService.getVesselProfitability();
        boolean sufficientData = completedTrips.size() >= MIN_COMPLETED_TRIPS_FOR_PREDICTION && !allSales.isEmpty();

        String geminiStatus = (geminiApiKey != null && !geminiApiKey.isBlank())
                ? "Connecté (" + geminiModel + ")"
                : "Mode analytique local (clé Gemini non configurée)";

        if (!sufficientData) {
            String insufficientMsg = String.format(
                    "Données historiques insuffisantes pour établir une prévision fiable : %d sortie(s) terminée(s) et %d vente(s) enregistrée(s) (minimum requis : %d sorties terminées et au moins 1 vente).",
                    completedTrips.size(), allSales.size(), MIN_COMPLETED_TRIPS_FOR_PREDICTION
            );

            predictionRepository.save(PredictionIA.builder()
                    .analysisType("FLEET_ANALYSIS")
                    .answerSummary(insufficientMsg)
                    .sufficientData(false)
                    .dataPointsUsed(completedTrips.size())
                    .prediction(false)
                    .modelName(geminiStatus)
                    .createdAt(LocalDateTime.now())
                    .build());

            return AiDtos.AiAnalysisResponse.builder()
                    .sufficientData(false)
                    .statusMessage(insufficientMsg)
                    .historicalTripsCount(completedTrips.size())
                    .historicalSalesCount(allSales.size())
                    .predictedNextMonthCatchKg(null)
                    .predictedNextMonthRevenue(null)
                    .actualTotalRevenue(actualRevenue)
                    .actualNetProfit(actualProfit)
                    .vesselProfitability(profitability)
                    .forecastSeries(List.of())
                    .recommendations(List.of(
                            AiDtos.AiRecommendationDto.builder()
                                    .title("Enregistrer davantage d'historique de marées")
                                    .detail("Clôturez au moins " + MIN_COMPLETED_TRIPS_FOR_PREDICTION + " sorties avec leurs ventes en criée pour activer les prévisions OceanAI.")
                                    .basedOnActualData(true)
                                    .build()
                    ))
                    .geminiIntegrationStatus(geminiStatus)
                    .build();
        }

        // Real historical calculation from completed trips & sales
        List<DashboardDtos.MonthlyStatDto> monthlyStats = dashboardService.getMonthlyStats();
        List<DashboardDtos.MonthlyStatDto> nonZeroMonths = monthlyStats.stream()
                .filter(m -> m.getRecettes().compareTo(BigDecimal.ZERO) > 0 || m.getCaptureKg().compareTo(BigDecimal.ZERO) > 0)
                .toList();

        BigDecimal avgMonthlyRevenue = nonZeroMonths.isEmpty()
                ? actualRevenue
                : nonZeroMonths.stream().map(DashboardDtos.MonthlyStatDto::getRecettes)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(nonZeroMonths.size()), 2, RoundingMode.HALF_UP);

        BigDecimal avgMonthlyCatchKg = nonZeroMonths.isEmpty()
                ? completedTrips.stream().map(SortiePeche::getTotalCatchKg).reduce(BigDecimal.ZERO, BigDecimal::add)
                : nonZeroMonths.stream().map(DashboardDtos.MonthlyStatDto::getCaptureKg)
                        .reduce(BigDecimal.ZERO, BigDecimal::add)
                        .divide(BigDecimal.valueOf(nonZeroMonths.size()), 2, RoundingMode.HALF_UP);

        // Conservative +6% seasonal momentum projection strictly marked isPrediction = true
        BigDecimal predictedRev = avgMonthlyRevenue.multiply(new BigDecimal("1.06")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal predictedCatch = avgMonthlyCatchKg.multiply(new BigDecimal("1.05")).setScale(2, RoundingMode.HALF_UP);

        List<AiDtos.ForecastPointDto> forecastSeries = new ArrayList<>();
        for (DashboardDtos.MonthlyStatDto m : nonZeroMonths) {
            forecastSeries.add(AiDtos.ForecastPointDto.builder()
                    .month(m.getMonth())
                    .historique(m.getRecettes())
                    .prevision(null)
                    .isPrediction(false)
                    .build());
        }

        YearMonth nextMonth = YearMonth.now().plusMonths(1);
        String nextMonthLabel = capitalize(nextMonth.getMonth().getDisplayName(TextStyle.SHORT, Locale.FRENCH).replace(".", ""))
                + " " + String.valueOf(nextMonth.getYear()).substring(2) + " (Prév.)";

        forecastSeries.add(AiDtos.ForecastPointDto.builder()
                .month(nextMonthLabel)
                .historique(null)
                .prevision(predictedRev)
                .isPrediction(true)
                .build());

        List<AiDtos.AiRecommendationDto> recommendations = buildRecommendations(profitability, completedTrips, actualRevenue, actualExpenses);

        String statusMsg = String.format(
                "Analyse établie sur %d marées terminées et %d ventes réelles enregistrées en base MySQL. Les projections du mois prochain sont explicitement marquées comme prévisions.",
                completedTrips.size(), allSales.size()
        );

        predictionRepository.save(PredictionIA.builder()
                .analysisType("FLEET_ANALYSIS")
                .answerSummary(statusMsg)
                .predictedCatchKg(predictedCatch)
                .predictedRevenue(predictedRev)
                .confidenceScore(new BigDecimal("82.50"))
                .sufficientData(true)
                .dataPointsUsed(completedTrips.size())
                .prediction(true)
                .modelName(geminiStatus)
                .createdAt(LocalDateTime.now())
                .build());

        return AiDtos.AiAnalysisResponse.builder()
                .sufficientData(true)
                .statusMessage(statusMsg)
                .historicalTripsCount(completedTrips.size())
                .historicalSalesCount(allSales.size())
                .predictedNextMonthCatchKg(predictedCatch)
                .predictedNextMonthRevenue(predictedRev)
                .actualTotalRevenue(actualRevenue)
                .actualNetProfit(actualProfit)
                .vesselProfitability(profitability)
                .forecastSeries(forecastSeries)
                .recommendations(recommendations)
                .geminiIntegrationStatus(geminiStatus)
                .build();
    }

    @Override
    @Transactional
    public AiDtos.AiAskResponse askQuestion(AiDtos.AiAskRequest request) {
        String question = request.getQuestion().trim();
        AiDtos.AiAnalysisResponse analysis = analyzeFleet();
        DashboardDtos.DashboardSummaryResponse summary = dashboardService.getDashboardSummary();

        boolean asksForForecast = containsAny(question.toLowerCase(Locale.ROOT),
                "prévision", "prevision", "prédire", "predire", "futur", "prochain", "mois prochain", "estimation");

        if (!analysis.isSufficientData() && asksForForecast) {
            String msg = "Impossible d'établir une prévision fiable : " + analysis.getStatusMessage();
            saveQuestionPrediction(question, msg, false, false, null, null, analysis.getHistoricalTripsCount(), "INSUFFICIENT_DATA_GUARD");
            return AiDtos.AiAskResponse.builder()
                    .answer(msg)
                    .isPrediction(false)
                    .sufficientData(false)
                    .historicalTripsCount(analysis.getHistoricalTripsCount())
                    .sourceMode("DONNEES_REELLES_MYSQL")
                    .timestamp(LocalDateTime.now().format(TS_FMT))
                    .highlights(List.of(
                            new AiDtos.AiHighlightDto("Sorties terminées", String.valueOf(analysis.getHistoricalTripsCount())),
                            new AiDtos.AiHighlightDto("Seuil minimum requis", String.valueOf(MIN_COMPLETED_TRIPS_FOR_PREDICTION))
                    ))
                    .build();
        }

        String contextPayload = buildGroundedContext(summary, analysis);
        String answerText;
        String sourceMode;

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            Optional<String> geminiReply = callGeminiApi(question, contextPayload);
            if (geminiReply.isPresent()) {
                answerText = geminiReply.get();
                sourceMode = "GEMINI_" + geminiModel.toUpperCase(Locale.ROOT);
            } else {
                answerText = buildLocalGroundedAnswer(question, summary, analysis, asksForForecast);
                sourceMode = "ANALYSE_HISTORIQUE_MYSQL";
            }
        } else {
            answerText = buildLocalGroundedAnswer(question, summary, analysis, asksForForecast);
            sourceMode = "ANALYSE_HISTORIQUE_MYSQL";
        }

        saveQuestionPrediction(
                question,
                answerText,
                asksForForecast && analysis.isSufficientData(),
                analysis.isSufficientData(),
                analysis.getPredictedNextMonthCatchKg(),
                analysis.getPredictedNextMonthRevenue(),
                analysis.getHistoricalTripsCount(),
                sourceMode
        );

        List<AiDtos.AiHighlightDto> highlights = new ArrayList<>();
        highlights.add(new AiDtos.AiHighlightDto("Recettes réelles (MySQL)", formatEuro(summary.getKpis().getTotalRevenue())));
        highlights.add(new AiDtos.AiHighlightDto("Bénéfice net réel", formatEuro(summary.getKpis().getNetProfit())));
        if (analysis.isSufficientData() && analysis.getPredictedNextMonthRevenue() != null) {
            highlights.add(new AiDtos.AiHighlightDto("Prévision CA mois +1 (IA)", formatEuro(analysis.getPredictedNextMonthRevenue())));
        }

        return AiDtos.AiAskResponse.builder()
                .answer(answerText)
                .isPrediction(asksForForecast && analysis.isSufficientData())
                .sufficientData(analysis.isSufficientData())
                .historicalTripsCount(analysis.getHistoricalTripsCount())
                .sourceMode(sourceMode)
                .timestamp(LocalDateTime.now().format(TS_FMT))
                .highlights(highlights)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiDtos.PredictionHistoryDto> getPredictionHistory() {
        return predictionRepository.findTop20ByOrderByCreatedAtDesc()
                .stream()
                .map(p -> AiDtos.PredictionHistoryDto.builder()
                        .id(p.getId())
                        .analysisType(p.getAnalysisType())
                        .promptQuestion(p.getPromptQuestion())
                        .answerSummary(p.getAnswerSummary())
                        .predictedCatchKg(p.getPredictedCatchKg())
                        .predictedRevenue(p.getPredictedRevenue())
                        .sufficientData(p.isSufficientData())
                        .isPrediction(p.isPrediction())
                        .modelName(p.getModelName())
                        .createdAt(p.getCreatedAt().format(TS_FMT))
                        .build())
                .toList();
    }

    private Optional<String> callGeminiApi(String question, String groundedContext) {
        try {
            String endpoint = String.format("%s/models/%s:generateContent?key=%s", geminiBaseUrl, geminiModel, geminiApiKey.trim());
            String prompt = """
                    Tu es OceanAI, analyste financier et halieutique de l'armement maritime Bahripay.
                    RÈGLES STRICTES :
                    1. Réponds en anglais professionnel, concis et structuré, et utilise uniquement le DH (Dirham) comme devise.
                    2. Distingue TOUJOURS clairement [DONNÉES RÉELLES] et [PRÉVISION STATISTIQUE IA].
                    3. N'invente jamais de chiffres absents du contexte ci-dessous.
                    
                    CONTEXTE BASE DE DONNÉES :
                    %s
                    
                    QUESTION UTILISATEUR :
                    %s
                    """.formatted(groundedContext, question);

            Map<String, Object> body = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    ))
            );

            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(8))
                    .build();

            HttpRequest httpReq = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(18))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = client.send(httpReq, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                JsonNode textNode = root.path("candidates").path(0).path("content").path("parts").path(0).path("text");
                if (!textNode.isMissingNode() && !textNode.asText().isBlank()) {
                    return Optional.of(textNode.asText().trim());
                }
            } else {
                log.warn("Gemini API returned status {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception ex) {
            log.warn("Gemini API call fallback to local analytical synthesis: {}", ex.getMessage());
        }
        return Optional.empty();
    }

    private String buildGroundedContext(DashboardDtos.DashboardSummaryResponse summary, AiDtos.AiAnalysisResponse analysis) {
        StringBuilder sb = new StringBuilder();
        DashboardDtos.KpiSummaryDto kpi = summary.getKpis();
        sb.append("[DONNÉES RÉELLES MYSQL]\n");
        sb.append("- Marins inscrits : ").append(kpi.getTotalSailors()).append("\n");
        sb.append("- Navires : ").append(kpi.getTotalVessels()).append(" (en mer : ").append(kpi.getVesselsAtSeaCount()).append(")\n");
        sb.append("- Sorties terminées analysables : ").append(analysis.getHistoricalTripsCount()).append("\n");
        sb.append("- Captures cumulées : ").append(kpi.getTotalCatchKg()).append(" kg\n");
        sb.append("- Recettes réelles : ").append(kpi.getTotalRevenue()).append(" DH\n");
        sb.append("- Dépenses réelles : ").append(kpi.getTotalExpenses()).append(" DH\n");
        sb.append("- Bénéfice net réel : ").append(kpi.getNetProfit()).append(" DH\n");
        sb.append("- Paiements équipage en attente : ").append(kpi.getPendingPaymentsAmount()).append(" DH (").append(kpi.getPendingPaymentsCount()).append(")\n");

        sb.append("Rentabilité par navire :\n");
        for (DashboardDtos.VesselProfitabilityDto vp : analysis.getVesselProfitability()) {
            sb.append(String.format("  * %s (%s) : CA=%s DH, Dépenses=%s DH, Net=%s DH, Marge=%d%%\n",
                    vp.getVesselName(), vp.getHomePort(), vp.getRevenue(), vp.getExpenses(), vp.getNetProfit(), vp.getMarginPercent()));
        }

        if (analysis.isSufficientData()) {
            sb.append("\n[PRÉVISION STATISTIQUE IA]\n");
            sb.append("- Captures prévues mois prochain : ").append(analysis.getPredictedNextMonthCatchKg()).append(" kg\n");
            sb.append("- Chiffre d'affaires prévu mois prochain : ").append(analysis.getPredictedNextMonthRevenue()).append(" DH\n");
        }
        return sb.toString();
    }

    private String buildLocalGroundedAnswer(
            String question,
            DashboardDtos.DashboardSummaryResponse summary,
            AiDtos.AiAnalysisResponse analysis,
            boolean asksForForecast
    ) {
        DashboardDtos.KpiSummaryDto kpi = summary.getKpis();
        DashboardDtos.VesselProfitabilityDto topVessel = analysis.getVesselProfitability().isEmpty()
                ? null : analysis.getVesselProfitability().get(0);

        StringBuilder sb = new StringBuilder();
        sb.append("[DONNÉES RÉELLES MYSQL] ");
        sb.append(String.format("L'armement totalise %s de chiffre d'affaires réel pour %s de dépenses, dégageant un bénéfice net de %s sur %s kg capturés.",
                formatEuro(kpi.getTotalRevenue()), formatEuro(kpi.getTotalExpenses()), formatEuro(kpi.getNetProfit()), kpi.getTotalCatchKg()));

        if (topVessel != null) {
            sb.append(String.format(" Le navire le plus rentable est %s (%s) avec %s de résultat net (marge de %d%%).",
                    topVessel.getVesselName(), topVessel.getHomePort(), formatEuro(topVessel.getNetProfit()), topVessel.getMarginPercent()));
        }

        if (kpi.getPendingPaymentsCount() > 0) {
            sb.append(String.format(" Attention : %d paiement(s) équipage restent en attente pour %s.",
                    kpi.getPendingPaymentsCount(), formatEuro(kpi.getPendingPaymentsAmount())));
        }

        if (analysis.isSufficientData() && (asksForForecast || containsAny(question.toLowerCase(Locale.ROOT), "bilan", "analyse", "conseil", "optimis"))) {
            sb.append("\n\n[PRÉVISION IA] ");
            sb.append(String.format("Basée sur vos %d marées terminées, la projection pour le mois prochain estime %s kg de captures pour un CA prévisionnel de %s.",
                    analysis.getHistoricalTripsCount(),
                    analysis.getPredictedNextMonthCatchKg(),
                    formatEuro(analysis.getPredictedNextMonthRevenue())));
        }
        return sb.toString();
    }

    private List<AiDtos.AiRecommendationDto> buildRecommendations(
            List<DashboardDtos.VesselProfitabilityDto> profitability,
            List<SortiePeche> completedTrips,
            BigDecimal actualRevenue,
            BigDecimal actualExpenses
    ) {
        List<AiDtos.AiRecommendationDto> list = new ArrayList<>();
        if (!profitability.isEmpty()) {
            DashboardDtos.VesselProfitabilityDto best = profitability.get(0);
            list.add(AiDtos.AiRecommendationDto.builder()
                    .title("Unité leader : " + best.getVesselName())
                    .detail(String.format("Marge observée de %d%% (%s net sur %d sortie(s)). Prioriser ce navire sur les zones à forte valeur ajoutée.",
                            best.getMarginPercent(), formatEuro(best.getNetProfit()), best.getTripsCount()))
                    .basedOnActualData(true)
                    .build());

            DashboardDtos.VesselProfitabilityDto lowest = profitability.get(profitability.size() - 1);
            if (lowest.getMarginPercent() < 25) {
                list.add(AiDtos.AiRecommendationDto.builder()
                        .title("Optimisation des coûts sur " + lowest.getVesselName())
                        .detail(String.format("Marge actuelle de %d%% (%s de dépenses). Auditer les postes carburant et maintenance.",
                                lowest.getMarginPercent(), formatEuro(lowest.getExpenses())))
                        .basedOnActualData(true)
                        .build());
            }
        }

        if (actualRevenue.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal costRatio = actualExpenses.multiply(new BigDecimal("100")).divide(actualRevenue, 1, RoundingMode.HALF_UP);
            list.add(AiDtos.AiRecommendationDto.builder()
                    .title("Ratio charges / recettes flotte : " + costRatio + "%")
                    .detail(String.format("Calculé sur %d marée(s) clôturée(s) et l'ensemble des factures réelles en base.", completedTrips.size()))
                    .basedOnActualData(true)
                    .build());
        }
        return list;
    }

    private void saveQuestionPrediction(
            String question,
            String answer,
            boolean isPrediction,
            boolean sufficientData,
            BigDecimal predictedCatchKg,
            BigDecimal predictedRevenue,
            int dataPoints,
            String modelName
    ) {
        predictionRepository.save(PredictionIA.builder()
                .analysisType("QUESTION_ASK")
                .promptQuestion(question.length() > 490 ? question.substring(0, 490) : question)
                .answerSummary(answer)
                .predictedCatchKg(predictedCatchKg)
                .predictedRevenue(predictedRevenue)
                .sufficientData(sufficientData)
                .dataPointsUsed(dataPoints)
                .prediction(isPrediction)
                .modelName(modelName)
                .createdAt(LocalDateTime.now())
                .build());
    }

    private boolean containsAny(String haystack, String... needles) {
        for (String n : needles) {
            if (haystack.contains(n)) return true;
        }
        return false;
    }

    private String formatEuro(BigDecimal amount) {
        if (amount == null) return "0.00 DH";
        return String.format(Locale.US, "%,.2f DH", amount);
    }

    private String capitalize(String s) {
        if (s == null || s.isEmpty()) return "";
        return Character.toUpperCase(s.charAt(0)) + s.substring(1);
    }
}
