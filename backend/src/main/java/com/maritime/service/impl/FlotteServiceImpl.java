package com.maritime.service.impl;

import com.maritime.dto.FlotteDtos;
import com.maritime.entity.*;
import com.maritime.enums.NotificationCategory;
import com.maritime.enums.NotificationSeverity;
import com.maritime.enums.TripStatus;
import com.maritime.enums.VesselStatus;
import com.maritime.exception.BadRequestException;
import com.maritime.exception.ConflictException;
import com.maritime.exception.ResourceNotFoundException;
import com.maritime.mapper.MaritimeMapper;
import com.maritime.repository.*;
import com.maritime.service.FlotteService;
import com.maritime.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class FlotteServiceImpl implements FlotteService {

    private final BateauRepository bateauRepository;
    private final MarinRepository marinRepository;
    private final SortiePecheRepository sortieRepository;
    private final EquipageRepository equipageRepository;
    private final EspecePoissonRepository especeRepository;
    private final ProductionPecheRepository productionRepository;
    private final VenteRepository venteRepository;
    private final NotificationService notificationService;
    private final MaritimeMapper mapper;

    @Override
    @Transactional(readOnly = true)
    public List<FlotteDtos.BateauResponse> listBateaux() {
        return bateauRepository.findAll().stream().map(mapper::toBateauResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FlotteDtos.BateauResponse getBateau(Long id) {
        return mapper.toBateauResponse(findBateauOrThrow(id));
    }

    @Override
    @Transactional
    public FlotteDtos.BateauResponse createBateau(FlotteDtos.BateauRequest request) {
        String reg = request.getRegistration().trim().toUpperCase();
        if (bateauRepository.existsByRegistrationIgnoreCase(reg)) {
            throw new ConflictException("Un bateau porte déjà l'immatriculation : " + reg);
        }

        Marin captain = request.getCaptainId() != null
                ? marinRepository.findById(request.getCaptainId())
                        .orElseThrow(() -> new ResourceNotFoundException("Capitaine introuvable : " + request.getCaptainId()))
                : null;

        Bateau bateau = Bateau.builder()
                .name(request.getName().trim())
                .registration(reg)
                .type(request.getType().trim())
                .capacityKg(request.getCapacityKg())
                .enginePowerHp(request.getEnginePowerHp())
                .lengthMeters(request.getLengthMeters())
                .homePort(request.getHomePort().trim())
                .status(request.getStatus() != null ? request.getStatus() : VesselStatus.DISPONIBLE)
                .captain(captain)
                .lastMaintenanceDate(request.getLastMaintenanceDate() != null ? request.getLastMaintenanceDate() : LocalDate.now())
                .imageUrl(request.getImageUrl() != null && !request.getImageUrl().isBlank()
                        ? request.getImageUrl()
                        : "/src/assets/images/vessel_trawler_hero_1795370246302.jpg")
                .build();

        return mapper.toBateauResponse(bateauRepository.save(bateau));
    }

    @Override
    @Transactional
    public FlotteDtos.BateauResponse updateBateau(Long id, FlotteDtos.BateauRequest request) {
        Bateau bateau = findBateauOrThrow(id);
        Marin captain = request.getCaptainId() != null
                ? marinRepository.findById(request.getCaptainId())
                        .orElseThrow(() -> new ResourceNotFoundException("Capitaine introuvable : " + request.getCaptainId()))
                : null;

        bateau.setName(request.getName().trim());
        bateau.setRegistration(request.getRegistration().trim().toUpperCase());
        bateau.setType(request.getType().trim());
        bateau.setCapacityKg(request.getCapacityKg());
        bateau.setEnginePowerHp(request.getEnginePowerHp());
        bateau.setLengthMeters(request.getLengthMeters());
        bateau.setHomePort(request.getHomePort().trim());
        if (request.getStatus() != null) bateau.setStatus(request.getStatus());
        bateau.setCaptain(captain);
        if (request.getLastMaintenanceDate() != null) bateau.setLastMaintenanceDate(request.getLastMaintenanceDate());
        if (request.getImageUrl() != null) bateau.setImageUrl(request.getImageUrl());

        return mapper.toBateauResponse(bateauRepository.save(bateau));
    }

    @Override
    @Transactional
    public FlotteDtos.BateauResponse updateBateauStatus(Long id, VesselStatus status) {
        Bateau bateau = findBateauOrThrow(id);
        bateau.setStatus(status);
        return mapper.toBateauResponse(bateauRepository.save(bateau));
    }

    @Override
    @Transactional
    public void deleteBateau(Long id) {
        if (!bateauRepository.existsById(id)) {
            throw new ResourceNotFoundException("Navire introuvable : " + id);
        }
        bateauRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlotteDtos.EspeceDto> listEspeces() {
        return especeRepository.findAll().stream().map(mapper::toEspeceDto).toList();
    }

    @Override
    @Transactional
    public FlotteDtos.EspeceDto createEspece(FlotteDtos.EspeceDto request) {
        EspecePoisson esp = EspecePoisson.builder()
                .code(request.getCode().trim().toUpperCase())
                .name(request.getName().trim())
                .scientificName(request.getScientificName())
                .defaultPricePerKg(request.getDefaultPricePerKg())
                .category(request.getCategory())
                .build();
        return mapper.toEspeceDto(especeRepository.save(esp));
    }

    @Override
    @Transactional
    public FlotteDtos.EspeceDto updateEspece(Long id, FlotteDtos.EspeceDto request) {
        EspecePoisson esp = especeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Espèce introuvable : " + id));
        esp.setCode(request.getCode().trim().toUpperCase());
        esp.setName(request.getName().trim());
        esp.setScientificName(request.getScientificName());
        esp.setDefaultPricePerKg(request.getDefaultPricePerKg());
        esp.setCategory(request.getCategory());
        return mapper.toEspeceDto(especeRepository.save(esp));
    }

    @Override
    @Transactional
    public void deleteEspece(Long id) {
        if (!especeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Espèce introuvable : " + id);
        }
        especeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlotteDtos.SortieResponse> listSorties(TripStatus status) {
        List<SortiePeche> sorties = status != null
                ? sortieRepository.findByStatusOrderByDepartureDateDesc(status)
                : sortieRepository.findAllByOrderByDepartureDateDesc();
        return sorties.stream().map(this::mapSortie).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public FlotteDtos.SortieResponse getSortie(Long id) {
        return mapSortie(findSortieOrThrow(id));
    }

    @Override
    @Transactional
    public FlotteDtos.SortieResponse createSortie(FlotteDtos.SortieRequest request) {
        Bateau bateau = findBateauOrThrow(request.getVesselId());
        if (request.getReturnDate() != null && request.getReturnDate().isBefore(request.getDepartureDate())) {
            throw new BadRequestException("La date de retour doit être postérieure à la date de départ.");
        }

        String tripCode = request.getCode() != null && !request.getCode().isBlank()
                ? request.getCode().trim().toUpperCase()
                : String.format("MAR-%d-%03d", LocalDate.now().getYear(), 114 + sortieRepository.count() + 1);

        TripStatus status = request.getStatus() != null ? request.getStatus() : TripStatus.PLANIFIEE;

        SortiePeche sortie = SortiePeche.builder()
                .code(tripCode)
                .bateau(bateau)
                .departureDate(request.getDepartureDate())
                .returnDate(request.getReturnDate())
                .zone(request.getZone().trim())
                .status(status)
                .notes(request.getNotes())
                .totalCatchKg(BigDecimal.ZERO)
                .estimatedRevenue(BigDecimal.ZERO)
                .build();

        SortiePeche saved = sortieRepository.save(sortie);

        if (request.getCrewIds() != null && !request.getCrewIds().isEmpty()) {
            syncCrew(saved, request.getCrewIds());
        }

        if (request.getCatches() != null && !request.getCatches().isEmpty()) {
            for (FlotteDtos.CatchInput c : request.getCatches()) {
                EspecePoisson espece = resolveEspece(c.getSpeciesId(), c.getSpecies(), c.getPricePerKg());
                BigDecimal val = c.getQuantityKg().multiply(c.getPricePerKg()).setScale(2, RoundingMode.HALF_UP);
                ProductionPeche prod = ProductionPeche.builder()
                        .sortie(saved)
                        .espece(espece)
                        .quantityKg(c.getQuantityKg())
                        .unitPricePerKg(c.getPricePerKg())
                        .totalValue(val)
                        .recordedAt(LocalDateTime.now())
                        .build();
                productionRepository.save(prod);
            }
            recomputeSortieTotals(saved);

            if (status == TripStatus.TERMINEE) {
                createAutoSalesForTrip(saved);
            }
        }

        if (status == TripStatus.EN_COURS) {
            bateau.setStatus(VesselStatus.EN_MER);
            bateauRepository.save(bateau);
        }

        notificationService.createAlert(
                "Nouvelle sortie " + saved.getCode() + " enregistrée",
                bateau.getName() + " — " + saved.getTotalCatchKg() + " kg déclarés (" + saved.getEstimatedRevenue() + " DH).",
                NotificationCategory.SORTIE,
                NotificationSeverity.INFO,
                "fleet"
        );

        return mapSortie(saved);
    }

    @Override
    @Transactional
    public FlotteDtos.SortieResponse updateSortie(Long id, FlotteDtos.SortieRequest request) {
        SortiePeche sortie = findSortieOrThrow(id);
        Bateau bateau = findBateauOrThrow(request.getVesselId());
        sortie.setBateau(bateau);
        sortie.setDepartureDate(request.getDepartureDate());
        sortie.setReturnDate(request.getReturnDate());
        sortie.setZone(request.getZone().trim());
        if (request.getStatus() != null) sortie.setStatus(request.getStatus());
        sortie.setNotes(request.getNotes());
        sortieRepository.save(sortie);

        if (request.getCrewIds() != null) {
            syncCrew(sortie, request.getCrewIds());
        }
        recomputeSortieTotals(sortie);
        return mapSortie(sortie);
    }

    @Override
    @Transactional
    public FlotteDtos.SortieResponse updateSortieStatus(Long id, TripStatus status) {
        SortiePeche sortie = findSortieOrThrow(id);
        sortie.setStatus(status);
        if (status == TripStatus.TERMINEE && sortie.getReturnDate() == null) {
            sortie.setReturnDate(LocalDateTime.now());
        }
        sortieRepository.save(sortie);

        Bateau bateau = sortie.getBateau();
        if (status == TripStatus.EN_COURS) {
            bateau.setStatus(VesselStatus.EN_MER);
            bateauRepository.save(bateau);
        } else if (status == TripStatus.TERMINEE && bateau.getStatus() == VesselStatus.EN_MER) {
            bateau.setStatus(VesselStatus.DISPONIBLE);
            bateauRepository.save(bateau);
            if (venteRepository.findBySortieId(sortie.getId()).isEmpty()) {
                createAutoSalesForTrip(sortie);
            }
        }
        return mapSortie(sortie);
    }

    @Override
    @Transactional
    public FlotteDtos.SortieResponse assignCrew(Long sortieId, List<Long> crewIds) {
        SortiePeche sortie = findSortieOrThrow(sortieId);
        syncCrew(sortie, crewIds);
        return mapSortie(sortie);
    }

    @Override
    @Transactional
    public void deleteSortie(Long id) {
        if (!sortieRepository.existsById(id)) {
            throw new ResourceNotFoundException("Sortie de pêche introuvable : " + id);
        }
        sortieRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<FlotteDtos.ProductionDto> listProductions(Long sortieId) {
        List<ProductionPeche> list = sortieId != null
                ? productionRepository.findBySortieId(sortieId)
                : productionRepository.findAll();
        return list.stream().map(mapper::toProductionDto).toList();
    }

    @Override
    @Transactional
    public FlotteDtos.ProductionDto addProduction(FlotteDtos.ProductionCreateRequest request) {
        SortiePeche sortie = findSortieOrThrow(request.getSortieId());
        EspecePoisson espece = resolveEspece(request.getSpeciesId(), request.getSpecies(), request.getPricePerKg());
        BigDecimal totalValue = request.getQuantityKg()
                .multiply(request.getPricePerKg())
                .setScale(2, RoundingMode.HALF_UP);

        ProductionPeche prod = ProductionPeche.builder()
                .sortie(sortie)
                .espece(espece)
                .quantityKg(request.getQuantityKg())
                .unitPricePerKg(request.getPricePerKg())
                .totalValue(totalValue)
                .recordedAt(LocalDateTime.now())
                .build();

        ProductionPeche saved = productionRepository.save(prod);
        recomputeSortieTotals(sortie);
        return mapper.toProductionDto(saved);
    }

    @Override
    @Transactional
    public void deleteProduction(Long id) {
        ProductionPeche prod = productionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Production introuvable : " + id));
        SortiePeche sortie = prod.getSortie();
        productionRepository.delete(prod);
        recomputeSortieTotals(sortie);
    }

    private void syncCrew(SortiePeche sortie, List<Long> crewIds) {
        equipageRepository.deleteBySortieId(sortie.getId());
        equipageRepository.flush();
        for (Long marinId : crewIds.stream().distinct().toList()) {
            Marin marin = marinRepository.findById(marinId)
                    .orElseThrow(() -> new ResourceNotFoundException("Marin introuvable : " + marinId));
            Equipage eq = Equipage.builder()
                    .sortie(sortie)
                    .marin(marin)
                    .roleAtSea(marin.getGrade().getLabel())
                    .shareWeightSnapshot(marin.getShareWeight())
                    .build();
            equipageRepository.save(eq);
        }
    }

    private void recomputeSortieTotals(SortiePeche sortie) {
        List<ProductionPeche> prods = productionRepository.findBySortieId(sortie.getId());
        BigDecimal totalKg = prods.stream()
                .map(ProductionPeche::getQuantityKg)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);
        BigDecimal estRev = prods.stream()
                .map(ProductionPeche::getTotalValue)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, RoundingMode.HALF_UP);

        sortie.setTotalCatchKg(totalKg);
        sortie.setEstimatedRevenue(estRev);
        sortieRepository.save(sortie);
    }

    private void createAutoSalesForTrip(SortiePeche sortie) {
        List<ProductionPeche> prods = productionRepository.findBySortieId(sortie.getId());
        LocalDate saleDate = sortie.getReturnDate() != null ? sortie.getReturnDate().toLocalDate() : LocalDate.now();
        for (ProductionPeche prod : prods) {
            Vente vente = Vente.builder()
                    .sortie(sortie)
                    .bateau(sortie.getBateau())
                    .espece(prod.getEspece())
                    .saleDate(saleDate)
                    .buyer("Criée portuaire directe")
                    .quantityKg(prod.getQuantityKg())
                    .pricePerKg(prod.getUnitPricePerKg())
                    .totalAmount(prod.getTotalValue())
                    .build();
            venteRepository.save(vente);
        }
    }

    private EspecePoisson resolveEspece(Long speciesId, String speciesName, BigDecimal fallbackPrice) {
        if (speciesId != null) {
            return especeRepository.findById(speciesId)
                    .orElseThrow(() -> new ResourceNotFoundException("Espèce introuvable : " + speciesId));
        }
        if (speciesName == null || speciesName.isBlank()) {
            throw new BadRequestException("L'espèce de poisson est obligatoire.");
        }
        return especeRepository.findByNameIgnoreCase(speciesName.trim())
                .orElseGet(() -> especeRepository.save(EspecePoisson.builder()
                        .code(speciesName.trim().substring(0, Math.min(3, speciesName.trim().length())).toUpperCase())
                        .name(speciesName.trim())
                        .defaultPricePerKg(fallbackPrice != null ? fallbackPrice : BigDecimal.TEN)
                        .category("Espèce déclarée")
                        .build()));
    }

    private Bateau findBateauOrThrow(Long id) {
        return bateauRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Navire introuvable : " + id));
    }

    private SortiePeche findSortieOrThrow(Long id) {
        return sortieRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Sortie de pêche introuvable : " + id));
    }

    private FlotteDtos.SortieResponse mapSortie(SortiePeche sortie) {
        List<Equipage> equipages = equipageRepository.findBySortieId(sortie.getId());
        List<ProductionPeche> productions = productionRepository.findBySortieId(sortie.getId());
        return mapper.toSortieResponse(sortie, equipages, productions);
    }
}
