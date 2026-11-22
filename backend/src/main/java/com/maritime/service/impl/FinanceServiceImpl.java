package com.maritime.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.maritime.dto.FinanceDtos;
import com.maritime.entity.*;
import com.maritime.enums.NotificationCategory;
import com.maritime.enums.NotificationSeverity;
import com.maritime.enums.PaymentStatus;
import com.maritime.exception.BadRequestException;
import com.maritime.exception.ConflictException;
import com.maritime.exception.ResourceNotFoundException;
import com.maritime.mapper.MaritimeMapper;
import com.maritime.repository.*;
import com.maritime.service.FinanceService;
import com.maritime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class FinanceServiceImpl implements FinanceService {

    private final VenteRepository venteRepository;
    private final DepenseRepository depenseRepository;
    private final RegleRepartitionRepository regleRepository;
    private final PaiementRepository paiementRepository;
    private final FichePaiementRepository fichePaiementRepository;
    private final BateauRepository bateauRepository;
    private final SortiePecheRepository sortieRepository;
    private final EspecePoissonRepository especeRepository;
    private final EquipageRepository equipageRepository;
    private final NotificationService notificationService;
    private final MaritimeMapper mapper;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<FinanceDtos.VenteResponse> listVentes() {
        return venteRepository.findAllByOrderBySaleDateDesc()
                .stream()
                .map(mapper::toVenteResponse)
                .toList();
    }

    @Override
    @Transactional
    public FinanceDtos.VenteResponse createVente(FinanceDtos.VenteRequest request) {
        Bateau bateau = bateauRepository.findById(request.getVesselId())
                .orElseThrow(() -> new ResourceNotFoundException("Navire introuvable : " + request.getVesselId()));

        SortiePeche sortie = request.getTripId() != null
                ? sortieRepository.findById(request.getTripId())
                        .orElseThrow(() -> new ResourceNotFoundException("Sortie introuvable : " + request.getTripId()))
                : null;

        EspecePoisson espece = resolveOrCreateSpecies(request.getSpeciesId(), request.getSpecies(), request.getPricePerKg());

        BigDecimal totalAmount = request.getQuantityKg()
                .multiply(request.getPricePerKg())
                .setScale(2, RoundingMode.HALF_UP);

        Vente vente = Vente.builder()
                .sortie(sortie)
                .bateau(bateau)
                .espece(espece)
                .saleDate(request.getDate() != null ? request.getDate() : LocalDate.now())
                .buyer(request.getBuyer().trim())
                .quantityKg(request.getQuantityKg().setScale(2, RoundingMode.HALF_UP))
                .pricePerKg(request.getPricePerKg().setScale(2, RoundingMode.HALF_UP))
                .totalAmount(totalAmount)
                .build();

        Vente saved = venteRepository.save(vente);

        if (totalAmount.compareTo(new BigDecimal("15000.00")) >= 0) {
            notificationService.createAlert(
                    "Vente majeure enregistrée",
                    String.format("Lot de %s (%s kg) vendu à %s pour %.2f €.",
                            espece.getName(), saved.getQuantityKg(), saved.getBuyer(), saved.getTotalAmount()),
                    NotificationCategory.FINANCE,
                    NotificationSeverity.SUCCESS,
                    "finances"
            );
        }

        return mapper.toVenteResponse(saved);
    }

    @Override
    @Transactional
    public void deleteVente(Long id) {
        if (!venteRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vente introuvable : " + id);
        }
        venteRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinanceDtos.DepenseResponse> listDepenses() {
        return depenseRepository.findAllByOrderByExpenseDateDesc()
                .stream()
                .map(mapper::toDepenseResponse)
                .toList();
    }

    @Override
    @Transactional
    public FinanceDtos.DepenseResponse createDepense(FinanceDtos.DepenseRequest request) {
        Bateau bateau = bateauRepository.findById(request.getVesselId())
                .orElseThrow(() -> new ResourceNotFoundException("Navire introuvable : " + request.getVesselId()));

        SortiePeche sortie = request.getTripId() != null
                ? sortieRepository.findById(request.getTripId())
                        .orElseThrow(() -> new ResourceNotFoundException("Sortie introuvable : " + request.getTripId()))
                : null;

        Depense depense = Depense.builder()
                .sortie(sortie)
                .bateau(bateau)
                .expenseDate(request.getDate() != null ? request.getDate() : LocalDate.now())
                .category(request.getCategory())
                .description(request.getDescription().trim())
                .amount(request.getAmount().setScale(2, RoundingMode.HALF_UP))
                .build();

        Depense saved = depenseRepository.save(depense);

        if (saved.getAmount().compareTo(new BigDecimal("5000.00")) >= 0) {
            notificationService.createAlert(
                    "Dépense importante enregistrée",
                    String.format("%s sur %s : %.2f € (%s).",
                            saved.getCategory().getLabel(), bateau.getName(), saved.getAmount(), saved.getDescription()),
                    NotificationCategory.FINANCE,
                    NotificationSeverity.WARNING,
                    "finances"
            );
        }

        return mapper.toDepenseResponse(saved);
    }

    @Override
    @Transactional
    public void deleteDepense(Long id) {
        if (!depenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Dépense introuvable : " + id);
        }
        depenseRepository.deleteById(id);
    }

    @Override
    @Transactional
    public FinanceDtos.RegleRepartitionDto getActiveShareRule() {
        RegleRepartition rule = regleRepository.findFirstByActiveTrueOrderByUpdatedAtDesc()
                .orElseGet(() -> regleRepository.save(RegleRepartition.builder()
                        .ruleName("Règle Armement Standard")
                        .boatSharePercent(new BigDecimal("45.00"))
                        .crewSharePercent(new BigDecimal("55.00"))
                        .deductCommonExpensesBeforeSplit(true)
                        .active(true)
                        .updatedAt(LocalDateTime.now())
                        .updatedByEmail("system@bahripay-armement.fr")
                        .build()));
        return mapper.toRegleDto(rule);
    }

    @Override
    @Transactional
    public FinanceDtos.RegleRepartitionDto updateShareRule(FinanceDtos.RegleRepartitionDto request, String actorEmail) {
        BigDecimal boatShare = request.getBoatSharePercent().setScale(2, RoundingMode.HALF_UP);
        BigDecimal crewShare = request.getCrewSharePercent().setScale(2, RoundingMode.HALF_UP);
        BigDecimal total = boatShare.add(crewShare);
        if (total.compareTo(new BigDecimal("100.00")) != 0) {
            throw new BadRequestException("La somme Part Armateur + Part Équipage doit être exactement égale à 100% (actuellement : " + total + "%).");
        }

        regleRepository.findAll().forEach(existing -> {
            if (existing.isActive()) {
                existing.setActive(false);
                regleRepository.save(existing);
            }
        });

        RegleRepartition updated = RegleRepartition.builder()
                .ruleName(request.getRuleName() != null && !request.getRuleName().isBlank()
                        ? request.getRuleName().trim()
                        : "Règle Armement Personnalisée")
                .boatSharePercent(boatShare)
                .crewSharePercent(crewShare)
                .deductCommonExpensesBeforeSplit(request.isDeductCommonExpensesBeforeSplit())
                .active(true)
                .updatedAt(LocalDateTime.now())
                .updatedByEmail(actorEmail != null ? actorEmail : "system@bahripay-armement.fr")
                .build();

        RegleRepartition saved = regleRepository.save(updated);

        notificationService.createAlert(
                "Règle de répartition mise à jour",
                String.format("Nouvelle clé : Armateur %.0f%% / Équipage %.0f%% (%s).",
                        saved.getBoatSharePercent(), saved.getCrewSharePercent(),
                        saved.isDeductCommonExpensesBeforeSplit() ? "après déduction frais communs" : "sur brut"),
                NotificationCategory.PAIEMENT,
                NotificationSeverity.INFO,
                "finances"
        );

        return mapper.toRegleDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FinanceDtos.PaiementResponse> listPaiements() {
        return paiementRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(mapper::toPaiementResponse)
                .toList();
    }

    @Override
    @Transactional
    public List<FinanceDtos.PaiementResponse> generateTripPayments(Long sortieId, String issuerName) {
        SortiePeche sortie = sortieRepository.findById(sortieId)
                .orElseThrow(() -> new ResourceNotFoundException("Sortie de pêche introuvable : " + sortieId));

        if (paiementRepository.existsBySortieId(sortieId)) {
            throw new ConflictException("Les parts d'équipage ont déjà été calculées pour la sortie " + sortie.getCode() + ".");
        }

        List<Equipage> equipages = equipageRepository.findBySortieId(sortieId);
        if (equipages.isEmpty()) {
            throw new BadRequestException("Aucun marin n'est affecté à l'équipage de la sortie " + sortie.getCode() + ".");
        }

        RegleRepartition rule = regleRepository.findFirstByActiveTrueOrderByUpdatedAtDesc()
                .orElseThrow(() -> new BadRequestException("Aucune règle de répartition active n'est configurée."));

        BigDecimal recordedSales = venteRepository.sumRevenueBySortieId(sortieId);
        BigDecimal grossRevenue = (recordedSales != null && recordedSales.compareTo(BigDecimal.ZERO) > 0)
                ? recordedSales
                : (sortie.getEstimatedRevenue() != null ? sortie.getEstimatedRevenue() : BigDecimal.ZERO);

        if (grossRevenue.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Le chiffre d'affaires de la sortie " + sortie.getCode() + " est nul ; enregistrez une vente ou une production valorisée avant de générer la paie.");
        }

        BigDecimal commonExpenses = depenseRepository.sumExpensesBySortieId(sortieId);
        if (commonExpenses == null) {
            commonExpenses = BigDecimal.ZERO;
        }

        BigDecimal netDistributable = rule.isDeductCommonExpensesBeforeSplit()
                ? grossRevenue.subtract(commonExpenses).max(BigDecimal.ZERO)
                : grossRevenue;

        BigDecimal crewPoolAmount = netDistributable
                .multiply(rule.getCrewSharePercent())
                .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);

        BigDecimal totalCrewWeights = equipages.stream()
                .map(Equipage::getShareWeightSnapshot)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalCrewWeights.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("La somme des parts d'équipage est invalide (<= 0).");
        }

        String periodLabel = String.format("Marée %s · %s", sortie.getCode(), sortie.getBateau().getName());
        List<Paiement> createdPayments = new ArrayList<>();

        for (Equipage eq : equipages) {
            BigDecimal weight = eq.getShareWeightSnapshot();
            BigDecimal amountDue = crewPoolAmount
                    .multiply(weight)
                    .divide(totalCrewWeights, 2, RoundingMode.HALF_UP);

            Paiement paiement = Paiement.builder()
                    .sortie(sortie)
                    .marin(eq.getMarin())
                    .regle(rule)
                    .periodLabel(periodLabel)
                    .grossTripRevenue(grossRevenue.setScale(2, RoundingMode.HALF_UP))
                    .commonExpenses(commonExpenses.setScale(2, RoundingMode.HALF_UP))
                    .netDistributable(netDistributable.setScale(2, RoundingMode.HALF_UP))
                    .crewPoolAmount(crewPoolAmount)
                    .sailorWeight(weight)
                    .totalCrewWeights(totalCrewWeights)
                    .amountDue(amountDue)
                    .status(PaymentStatus.EN_ATTENTE)
                    .createdAt(LocalDateTime.now())
                    .build();

            Paiement savedPaiement = paiementRepository.save(paiement);

            String reference = String.format("FP-%d-S%d-M%d",
                    LocalDate.now().getYear(), sortie.getId(), eq.getMarin().getId());

            FichePaiement fiche = FichePaiement.builder()
                    .referenceNumber(reference)
                    .paiement(savedPaiement)
                    .generatedAt(LocalDateTime.now())
                    .boatSharePercentSnapshot(rule.getBoatSharePercent())
                    .crewSharePercentSnapshot(rule.getCrewSharePercent())
                    .expensesDeducted(rule.isDeductCommonExpensesBeforeSplit())
                    .breakdownJson(buildBreakdownJson(savedPaiement, rule))
                    .issuerName(issuerName != null && !issuerName.isBlank() ? issuerName : "Armement Bahripay")
                    .remarks("Décompte à la part calculé selon la règle active : " + rule.getRuleName())
                    .build();

            fichePaiementRepository.save(fiche);
            savedPaiement.setFichePaiement(fiche);
            createdPayments.add(savedPaiement);
        }

        notificationService.createAlert(
                "Paiements générés — " + sortie.getCode(),
                String.format("%d fiches de paie générées pour un total équipage de %.2f €.",
                        createdPayments.size(), crewPoolAmount),
                NotificationCategory.PAIEMENT,
                NotificationSeverity.SUCCESS,
                "finances"
        );

        return createdPayments.stream().map(mapper::toPaiementResponse).toList();
    }

    @Override
    @Transactional
    public FinanceDtos.PaiementResponse markPaymentPaid(Long paymentId) {
        Paiement paiement = paiementRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable : " + paymentId));

        if (paiement.getStatus() == PaymentStatus.PAYE) {
            return mapper.toPaiementResponse(paiement);
        }

        paiement.setStatus(PaymentStatus.PAYE);
        paiement.setPaidAt(LocalDate.now());
        Paiement saved = paiementRepository.save(paiement);

        return mapper.toPaiementResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FinanceDtos.FichePaiementResponse getPaymentSlip(Long paymentId) {
        FichePaiement fiche = fichePaiementRepository.findByPaiementId(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Fiche de paiement introuvable pour le paiement : " + paymentId));
        return mapper.toFichePaiementResponse(fiche);
    }

    private EspecePoisson resolveOrCreateSpecies(Long speciesId, String speciesName, BigDecimal fallbackPrice) {
        if (speciesId != null) {
            return especeRepository.findById(speciesId)
                    .orElseThrow(() -> new ResourceNotFoundException("Espèce introuvable : " + speciesId));
        }
        String trimmed = speciesName.trim();
        return especeRepository.findByNameIgnoreCase(trimmed)
                .orElseGet(() -> {
                    String code = trimmed.replaceAll("[^a-zA-Z0-9]", "")
                            .toUpperCase();
                    if (code.length() > 8) code = code.substring(0, 8);
                    if (code.isBlank()) code = "ESP" + System.currentTimeMillis() % 1000;
                    return especeRepository.save(EspecePoisson.builder()
                            .code(code + "-" + (System.currentTimeMillis() % 100))
                            .name(trimmed)
                            .defaultPricePerKg(fallbackPrice)
                            .category("Pêche côtière")
                            .build());
                });
    }

    private String buildBreakdownJson(Paiement p, RegleRepartition rule) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("ruleName", rule.getRuleName());
        map.put("boatSharePercent", rule.getBoatSharePercent());
        map.put("crewSharePercent", rule.getCrewSharePercent());
        map.put("grossRevenue", p.getGrossTripRevenue());
        map.put("commonExpenses", p.getCommonExpenses());
        map.put("netDistributable", p.getNetDistributable());
        map.put("crewPoolAmount", p.getCrewPoolAmount());
        map.put("sailorWeight", p.getSailorWeight());
        map.put("totalCrewWeights", p.getTotalCrewWeights());
        map.put("amountDue", p.getAmountDue());
        try {
            return objectMapper.writeValueAsString(map);
        } catch (JsonProcessingException e) {
            return "{}";
        }
    }
}
