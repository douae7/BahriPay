package com.maritime.mapper;

import com.maritime.dto.*;
import com.maritime.entity.*;
import com.maritime.enums.ContractType;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.List;

@Component
public class MaritimeMapper {

    private static final DateTimeFormatter DATE_TIME_FMT = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    public AuthDtos.UserDto toUserDto(User user) {
        return AuthDtos.UserDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName().name())
                .portAttache(user.getPortAttache())
                .avatarInitials(user.getAvatarInitials())
                .enabled(user.isEnabled())
                .build();
    }

    public MarinDtos.GradeDto toGradeDto(Grade grade) {
        return MarinDtos.GradeDto.builder()
                .id(grade.getId())
                .code(grade.getCode())
                .label(grade.getLabel())
                .defaultShareWeight(grade.getDefaultShareWeight())
                .description(grade.getDescription())
                .build();
    }

    public MarinDtos.ContratDto toContratDto(Contrat c) {
        return MarinDtos.ContratDto.builder()
                .id(c.getId())
                .marinId(c.getMarin().getId())
                .marinFullName(c.getMarin().getFirstName() + " " + c.getMarin().getLastName())
                .contractType(c.getContractType())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .customShareWeight(c.getCustomShareWeight())
                .active(c.isActive())
                .notes(c.getNotes())
                .build();
    }

    public MarinDtos.AbsenceDto toAbsenceDto(Absence a) {
        return MarinDtos.AbsenceDto.builder()
                .id(a.getId())
                .marinId(a.getMarin().getId())
                .type(a.getType())
                .startDate(a.getStartDate())
                .endDate(a.getEndDate())
                .days(a.getDays())
                .note(a.getNote())
                .build();
    }

    public MarinDtos.DocumentDto toDocumentDto(DocumentAdministratif d) {
        return MarinDtos.DocumentDto.builder()
                .id(d.getId())
                .marinId(d.getMarin().getId())
                .name(d.getName())
                .documentType(d.getDocumentType())
                .fileName(d.getFileName())
                .contentType(d.getContentType())
                .fileSize(d.getFileSize())
                .status(d.getStatus())
                .expiryDate(d.getExpiryDate())
                .uploadedAt(d.getUploadedAt() != null ? d.getUploadedAt().format(DATE_TIME_FMT) : null)
                .build();
    }

    public MarinDtos.MarinResponse toMarinResponse(Marin m, List<Contrat> contrats, List<Absence> absences, List<DocumentAdministratif> docs) {
        Contrat activeContrat = contrats.stream()
                .filter(Contrat::isActive)
                .max(Comparator.comparing(Contrat::getStartDate))
                .orElse(contrats.stream().findFirst().orElse(null));

        return MarinDtos.MarinResponse.builder()
                .id(m.getId())
                .registrationNumber(m.getRegistrationNumber())
                .firstName(m.getFirstName())
                .lastName(m.getLastName())
                .phone(m.getPhone())
                .email(m.getEmail())
                .grade(m.getGrade().getLabel())
                .shareWeight(m.getShareWeight())
                .status(m.getStatus())
                .contractType(activeContrat != null ? activeContrat.getContractType() : ContractType.A_LA_PART)
                .contractStart(activeContrat != null ? activeContrat.getStartDate() : null)
                .contractEnd(activeContrat != null ? activeContrat.getEndDate() : null)
                .vesselId(m.getBateau() != null ? m.getBateau().getId() : null)
                .vesselName(m.getBateau() != null ? m.getBateau().getName() : null)
                .portAttache(m.getPortAttache())
                .yearsExperience(m.getYearsExperience())
                .documents(docs.stream().map(this::toDocumentDto).toList())
                .absences(absences.stream().map(this::toAbsenceDto).toList())
                .build();
    }

    public FlotteDtos.BateauResponse toBateauResponse(Bateau b) {
        return FlotteDtos.BateauResponse.builder()
                .id(b.getId())
                .name(b.getName())
                .registration(b.getRegistration())
                .type(b.getType())
                .capacityKg(b.getCapacityKg())
                .enginePowerHp(b.getEnginePowerHp())
                .lengthMeters(b.getLengthMeters())
                .homePort(b.getHomePort())
                .status(b.getStatus())
                .captainId(b.getCaptain() != null ? b.getCaptain().getId() : null)
                .captainName(b.getCaptain() != null ? b.getCaptain().getFirstName() + " " + b.getCaptain().getLastName() : null)
                .lastMaintenanceDate(b.getLastMaintenanceDate())
                .imageUrl(b.getImageUrl())
                .build();
    }

    public FlotteDtos.EspeceDto toEspeceDto(EspecePoisson e) {
        return FlotteDtos.EspeceDto.builder()
                .id(e.getId())
                .code(e.getCode())
                .name(e.getName())
                .scientificName(e.getScientificName())
                .defaultPricePerKg(e.getDefaultPricePerKg())
                .category(e.getCategory())
                .build();
    }

    public FlotteDtos.ProductionDto toProductionDto(ProductionPeche p) {
        return FlotteDtos.ProductionDto.builder()
                .id(p.getId())
                .sortieId(p.getSortie().getId())
                .speciesId(p.getEspece().getId())
                .species(p.getEspece().getName())
                .quantityKg(p.getQuantityKg())
                .pricePerKg(p.getUnitPricePerKg())
                .totalValue(p.getTotalValue())
                .build();
    }

    public FlotteDtos.SortieResponse toSortieResponse(SortiePeche s, List<Equipage> equipages, List<ProductionPeche> productions) {
        return FlotteDtos.SortieResponse.builder()
                .id(s.getId())
                .code(s.getCode())
                .vesselId(s.getBateau().getId())
                .vesselName(s.getBateau().getName())
                .crewIds(equipages.stream().map(eq -> eq.getMarin().getId()).toList())
                .departureDate(s.getDepartureDate())
                .returnDate(s.getReturnDate())
                .zone(s.getZone())
                .status(s.getStatus())
                .catches(productions.stream().map(this::toProductionDto).toList())
                .totalCatchKg(s.getTotalCatchKg())
                .estimatedRevenue(s.getEstimatedRevenue())
                .notes(s.getNotes())
                .build();
    }

    public FinanceDtos.VenteResponse toVenteResponse(Vente v) {
        return FinanceDtos.VenteResponse.builder()
                .id(v.getId())
                .tripId(v.getSortie() != null ? v.getSortie().getId() : null)
                .vesselId(v.getBateau().getId())
                .vesselName(v.getBateau().getName())
                .date(v.getSaleDate())
                .species(v.getEspece().getName())
                .buyer(v.getBuyer())
                .quantityKg(v.getQuantityKg())
                .pricePerKg(v.getPricePerKg())
                .totalAmount(v.getTotalAmount())
                .build();
    }

    public FinanceDtos.DepenseResponse toDepenseResponse(Depense d) {
        return FinanceDtos.DepenseResponse.builder()
                .id(d.getId())
                .tripId(d.getSortie() != null ? d.getSortie().getId() : null)
                .vesselId(d.getBateau().getId())
                .vesselName(d.getBateau().getName())
                .date(d.getExpenseDate())
                .category(d.getCategory())
                .description(d.getDescription())
                .amount(d.getAmount())
                .build();
    }

    public FinanceDtos.RegleRepartitionDto toRegleDto(RegleRepartition r) {
        return FinanceDtos.RegleRepartitionDto.builder()
                .id(r.getId())
                .ruleName(r.getRuleName())
                .boatSharePercent(r.getBoatSharePercent())
                .crewSharePercent(r.getCrewSharePercent())
                .deductCommonExpensesBeforeSplit(r.isDeductCommonExpensesBeforeSplit())
                .updatedAt(r.getUpdatedAt() != null ? r.getUpdatedAt().format(DATE_TIME_FMT) : null)
                .updatedByEmail(r.getUpdatedByEmail())
                .build();
    }

    public FinanceDtos.PaiementResponse toPaiementResponse(Paiement p) {
        return FinanceDtos.PaiementResponse.builder()
                .id(p.getId())
                .sailorId(p.getMarin().getId())
                .sailorName(p.getMarin().getFirstName() + " " + p.getMarin().getLastName())
                .sailorGrade(p.getMarin().getGrade().getLabel())
                .tripId(p.getSortie().getId())
                .periodLabel(p.getPeriodLabel())
                .grossTripRevenue(p.getGrossTripRevenue())
                .commonExpenses(p.getCommonExpenses())
                .netDistributable(p.getNetDistributable())
                .crewPoolAmount(p.getCrewPoolAmount())
                .sailorWeight(p.getSailorWeight())
                .totalCrewWeights(p.getTotalCrewWeights())
                .amountDue(p.getAmountDue())
                .status(p.getStatus())
                .paidAt(p.getPaidAt())
                .build();
    }

    public FinanceDtos.FichePaiementResponse toFichePaiementResponse(FichePaiement f) {
        Paiement p = f.getPaiement();
        return FinanceDtos.FichePaiementResponse.builder()
                .id(f.getId())
                .referenceNumber(f.getReferenceNumber())
                .paymentId(p.getId())
                .sailorName(p.getMarin().getFirstName() + " " + p.getMarin().getLastName())
                .sailorRegistrationNumber(p.getMarin().getRegistrationNumber())
                .periodLabel(p.getPeriodLabel())
                .boatSharePercentSnapshot(f.getBoatSharePercentSnapshot())
                .crewSharePercentSnapshot(f.getCrewSharePercentSnapshot())
                .expensesDeducted(f.isExpensesDeducted())
                .grossTripRevenue(p.getGrossTripRevenue())
                .commonExpenses(p.getCommonExpenses())
                .netDistributable(p.getNetDistributable())
                .crewPoolAmount(p.getCrewPoolAmount())
                .sailorWeight(p.getSailorWeight())
                .totalCrewWeights(p.getTotalCrewWeights())
                .amountDue(p.getAmountDue())
                .status(p.getStatus())
                .paidAt(p.getPaidAt())
                .generatedAt(f.getGeneratedAt() != null ? f.getGeneratedAt().format(DATE_TIME_FMT) : null)
                .issuerName(f.getIssuerName())
                .remarks(f.getRemarks())
                .build();
    }

    public NotificationDto toNotificationDto(Notification n) {
        return NotificationDto.builder()
                .id(n.getId())
                .title(n.getTitle())
                .message(n.getMessage())
                .category(n.getCategory())
                .severity(n.getSeverity())
                .createdAt(n.getCreatedAt() != null ? n.getCreatedAt().format(DATE_TIME_FMT) : "")
                .read(n.isRead())
                .targetPage(n.getTargetPage())
                .build();
    }
}
