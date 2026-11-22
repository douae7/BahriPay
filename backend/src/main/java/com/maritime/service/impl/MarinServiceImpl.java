package com.maritime.service.impl;

import com.maritime.dto.MarinDtos;
import com.maritime.entity.*;
import com.maritime.enums.ContractType;
import com.maritime.enums.DocumentStatus;
import com.maritime.enums.SailorStatus;
import com.maritime.exception.BadRequestException;
import com.maritime.exception.ConflictException;
import com.maritime.exception.ResourceNotFoundException;
import com.maritime.mapper.MaritimeMapper;
import com.maritime.repository.*;
import com.maritime.service.MarinService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MarinServiceImpl implements MarinService {

    private final MarinRepository marinRepository;
    private final GradeRepository gradeRepository;
    private final ContratRepository contratRepository;
    private final AbsenceRepository absenceRepository;
    private final DocumentAdministratifRepository documentRepository;
    private final BateauRepository bateauRepository;
    private final MaritimeMapper mapper;

    @Value("${app.storage.documents-dir:./uploads/documents}")
    private String documentsDir;

    @Override
    @Transactional(readOnly = true)
    public List<MarinDtos.MarinResponse> searchMarins(String search, String grade, SailorStatus status) {
        String normalizedGrade = (grade != null && !grade.equalsIgnoreCase("ALL")) ? grade : null;
        return marinRepository.searchFiltered(search, normalizedGrade, status)
                .stream()
                .map(this::mapFullMarin)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public MarinDtos.MarinResponse getMarin(Long id) {
        Marin marin = findMarinOrThrow(id);
        return mapFullMarin(marin);
    }

    @Override
    @Transactional
    public MarinDtos.MarinResponse createMarin(MarinDtos.MarinRequest request) {
        if (marinRepository.existsByRegistrationNumberIgnoreCase(request.getRegistrationNumber().trim())) {
            throw new ConflictException("Le matricule ENIM existe déjà : " + request.getRegistrationNumber());
        }

        Grade grade = resolveGrade(request.getGrade());
        BigDecimal weight = request.getShareWeight() != null ? request.getShareWeight() : grade.getDefaultShareWeight();
        Bateau vessel = request.getVesselId() != null
                ? bateauRepository.findById(request.getVesselId())
                        .orElseThrow(() -> new ResourceNotFoundException("Bateau introuvable : " + request.getVesselId()))
                : null;

        Marin marin = Marin.builder()
                .registrationNumber(request.getRegistrationNumber().trim().toUpperCase())
                .firstName(request.getFirstName().trim())
                .lastName(request.getLastName().trim())
                .phone(request.getPhone().trim())
                .email(request.getEmail().trim())
                .grade(grade)
                .shareWeight(weight)
                .status(request.getStatus() != null ? request.getStatus() : SailorStatus.ACTIF)
                .portAttache(request.getPortAttache().trim())
                .yearsExperience(Math.max(0, request.getYearsExperience()))
                .bateau(vessel)
                .build();

        Marin saved = marinRepository.save(marin);

        Contrat contrat = Contrat.builder()
                .marin(saved)
                .contractType(request.getContractType() != null ? request.getContractType() : ContractType.A_LA_PART)
                .startDate(request.getContractStart() != null ? request.getContractStart() : LocalDate.now())
                .endDate(request.getContractEnd())
                .customShareWeight(weight)
                .active(true)
                .build();
        contratRepository.save(contrat);

        DocumentAdministratif medDoc = DocumentAdministratif.builder()
                .marin(saved)
                .name("Visite médicale gens de mer")
                .documentType("MEDICAL")
                .status(DocumentStatus.VALIDE)
                .expiryDate(LocalDate.now().plusYears(1))
                .uploadedAt(LocalDateTime.now())
                .build();
        DocumentAdministratif stcwDoc = DocumentAdministratif.builder()
                .marin(saved)
                .name("Certificat sécurité STCW")
                .documentType("STCW")
                .status(DocumentStatus.A_RENOUVELER)
                .expiryDate(LocalDate.now().plusMonths(3))
                .uploadedAt(LocalDateTime.now())
                .build();
        documentRepository.saveAll(List.of(medDoc, stcwDoc));

        return mapFullMarin(saved);
    }

    @Override
    @Transactional
    public MarinDtos.MarinResponse updateMarin(Long id, MarinDtos.MarinRequest request) {
        Marin marin = findMarinOrThrow(id);
        Grade grade = resolveGrade(request.getGrade());
        BigDecimal weight = request.getShareWeight() != null ? request.getShareWeight() : grade.getDefaultShareWeight();

        Bateau vessel = request.getVesselId() != null
                ? bateauRepository.findById(request.getVesselId())
                        .orElseThrow(() -> new ResourceNotFoundException("Bateau introuvable : " + request.getVesselId()))
                : null;

        marin.setRegistrationNumber(request.getRegistrationNumber().trim().toUpperCase());
        marin.setFirstName(request.getFirstName().trim());
        marin.setLastName(request.getLastName().trim());
        marin.setPhone(request.getPhone().trim());
        marin.setEmail(request.getEmail().trim());
        marin.setGrade(grade);
        marin.setShareWeight(weight);
        if (request.getStatus() != null) {
            marin.setStatus(request.getStatus());
        }
        marin.setPortAttache(request.getPortAttache().trim());
        marin.setYearsExperience(Math.max(0, request.getYearsExperience()));
        marin.setBateau(vessel);

        Marin saved = marinRepository.save(marin);

        if (request.getContractType() != null) {
            List<Contrat> contrats = contratRepository.findByMarinIdOrderByStartDateDesc(saved.getId());
            Contrat active = contrats.stream().filter(Contrat::isActive).findFirst().orElse(null);
            if (active != null) {
                active.setContractType(request.getContractType());
                if (request.getContractStart() != null) active.setStartDate(request.getContractStart());
                active.setEndDate(request.getContractEnd());
                active.setCustomShareWeight(weight);
                contratRepository.save(active);
            } else {
                contratRepository.save(Contrat.builder()
                        .marin(saved)
                        .contractType(request.getContractType())
                        .startDate(request.getContractStart() != null ? request.getContractStart() : LocalDate.now())
                        .endDate(request.getContractEnd())
                        .customShareWeight(weight)
                        .active(true)
                        .build());
            }
        }

        return mapFullMarin(saved);
    }

    @Override
    @Transactional
    public void deleteMarin(Long id) {
        Marin marin = findMarinOrThrow(id);
        List<Bateau> captained = bateauRepository.findAll().stream()
                .filter(b -> b.getCaptain() != null && b.getCaptain().getId().equals(id))
                .toList();
        captained.forEach(b -> b.setCaptain(null));
        bateauRepository.saveAll(captained);
        marinRepository.delete(marin);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarinDtos.GradeDto> listGrades() {
        return gradeRepository.findAll().stream().map(mapper::toGradeDto).toList();
    }

    @Override
    @Transactional
    public MarinDtos.GradeDto createGrade(MarinDtos.GradeDto request) {
        Grade grade = Grade.builder()
                .code(request.getCode().trim().toUpperCase())
                .label(request.getLabel().trim())
                .defaultShareWeight(request.getDefaultShareWeight())
                .description(request.getDescription())
                .build();
        return mapper.toGradeDto(gradeRepository.save(grade));
    }

    @Override
    @Transactional
    public MarinDtos.GradeDto updateGrade(Long id, MarinDtos.GradeDto request) {
        Grade grade = gradeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Grade introuvable : " + id));
        grade.setCode(request.getCode().trim().toUpperCase());
        grade.setLabel(request.getLabel().trim());
        grade.setDefaultShareWeight(request.getDefaultShareWeight());
        grade.setDescription(request.getDescription());
        return mapper.toGradeDto(gradeRepository.save(grade));
    }

    @Override
    @Transactional
    public void deleteGrade(Long id) {
        if (!gradeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Grade introuvable : " + id);
        }
        gradeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarinDtos.ContratDto> listContrats(Long marinId) {
        List<Contrat> list = marinId != null
                ? contratRepository.findByMarinIdOrderByStartDateDesc(marinId)
                : contratRepository.findAll();
        return list.stream().map(mapper::toContratDto).toList();
    }

    @Override
    @Transactional
    public MarinDtos.ContratDto createContrat(MarinDtos.ContratRequest request) {
        Marin marin = findMarinOrThrow(request.getMarinId());
        if (request.isActive()) {
            contratRepository.findByMarinIdOrderByStartDateDesc(marin.getId())
                    .forEach(c -> {
                        c.setActive(false);
                        contratRepository.save(c);
                    });
        }
        Contrat contrat = Contrat.builder()
                .marin(marin)
                .contractType(request.getContractType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .customShareWeight(request.getCustomShareWeight() != null ? request.getCustomShareWeight() : marin.getShareWeight())
                .active(request.isActive())
                .notes(request.getNotes())
                .build();
        return mapper.toContratDto(contratRepository.save(contrat));
    }

    @Override
    @Transactional
    public MarinDtos.ContratDto updateContrat(Long id, MarinDtos.ContratRequest request) {
        Contrat contrat = contratRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contrat introuvable : " + id));
        contrat.setContractType(request.getContractType());
        contrat.setStartDate(request.getStartDate());
        contrat.setEndDate(request.getEndDate());
        contrat.setCustomShareWeight(request.getCustomShareWeight());
        contrat.setActive(request.isActive());
        contrat.setNotes(request.getNotes());
        return mapper.toContratDto(contratRepository.save(contrat));
    }

    @Override
    @Transactional
    public void deleteContrat(Long id) {
        if (!contratRepository.existsById(id)) {
            throw new ResourceNotFoundException("Contrat introuvable : " + id);
        }
        contratRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarinDtos.AbsenceDto> listAbsences(Long marinId) {
        List<Absence> list = marinId != null
                ? absenceRepository.findByMarinIdOrderByStartDateDesc(marinId)
                : absenceRepository.findAll();
        return list.stream().map(mapper::toAbsenceDto).toList();
    }

    @Override
    @Transactional
    public MarinDtos.AbsenceDto createAbsence(MarinDtos.AbsenceRequest request) {
        Marin marin = findMarinOrThrow(request.getMarinId());
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("La date de fin d'absence doit être postérieure à la date de début.");
        }
        int computedDays = request.getDays() != null && request.getDays() > 0
                ? request.getDays()
                : (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        Absence absence = Absence.builder()
                .marin(marin)
                .type(request.getType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .days(computedDays)
                .note(request.getNote())
                .build();
        return mapper.toAbsenceDto(absenceRepository.save(absence));
    }

    @Override
    @Transactional
    public void deleteAbsence(Long id) {
        if (!absenceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Absence introuvable : " + id);
        }
        absenceRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MarinDtos.DocumentDto> listDocuments(Long marinId) {
        return documentRepository.findByMarinIdOrderByUploadedAtDesc(marinId)
                .stream().map(mapper::toDocumentDto).toList();
    }

    @Override
    @Transactional
    public MarinDtos.DocumentDto createDocumentMetadata(MarinDtos.DocumentRequest request) {
        Marin marin = findMarinOrThrow(request.getMarinId());
        DocumentAdministratif doc = DocumentAdministratif.builder()
                .marin(marin)
                .name(request.getName().trim())
                .documentType(request.getDocumentType())
                .status(request.getStatus() != null ? request.getStatus() : DocumentStatus.VALIDE)
                .expiryDate(request.getExpiryDate())
                .uploadedAt(LocalDateTime.now())
                .build();
        return mapper.toDocumentDto(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public MarinDtos.DocumentDto uploadDocument(Long marinId, String name, String documentType, LocalDate expiryDate, MultipartFile file) {
        Marin marin = findMarinOrThrow(marinId);
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Le fichier document est vide ou manquant.");
        }
        try {
            Path rootPath = Paths.get(documentsDir).toAbsolutePath().normalize();
            Files.createDirectories(rootPath);
            String originalName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "document.pdf";
            String safeName = originalName.replaceAll("[^a-zA-Z0-9._-]", "_");
            String storedFileName = UUID.randomUUID() + "_" + safeName;
            Path targetPath = rootPath.resolve(storedFileName);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            DocumentAdministratif doc = DocumentAdministratif.builder()
                    .marin(marin)
                    .name(name != null && !name.isBlank() ? name.trim() : safeName)
                    .documentType(documentType != null ? documentType : "ADMINISTRATIF")
                    .fileName(safeName)
                    .filePath(targetPath.toString())
                    .contentType(file.getContentType())
                    .fileSize(file.getSize())
                    .status(DocumentStatus.VALIDE)
                    .expiryDate(expiryDate)
                    .uploadedAt(LocalDateTime.now())
                    .build();
            return mapper.toDocumentDto(documentRepository.save(doc));
        } catch (IOException ex) {
            throw new BadRequestException("Impossible d'enregistrer le document : " + ex.getMessage());
        }
    }

    @Override
    @Transactional
    public MarinDtos.DocumentDto updateDocumentStatus(Long docId, DocumentStatus status) {
        DocumentAdministratif doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable : " + docId));
        doc.setStatus(status);
        return mapper.toDocumentDto(documentRepository.save(doc));
    }

    @Override
    @Transactional(readOnly = true)
    public Resource loadDocumentResource(Long docId) {
        DocumentAdministratif doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable : " + docId));
        if (doc.getFilePath() == null) {
            throw new ResourceNotFoundException("Aucun fichier binaire attaché à ce document.");
        }
        try {
            Path filePath = Paths.get(doc.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                throw new ResourceNotFoundException("Fichier introuvable sur le serveur.");
            }
            return resource;
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Chemin de fichier invalide.");
        }
    }

    @Override
    @Transactional(readOnly = true)
    public String getDocumentFileName(Long docId) {
        DocumentAdministratif doc = documentRepository.findById(docId)
                .orElseThrow(() -> new ResourceNotFoundException("Document introuvable : " + docId));
        return doc.getFileName() != null ? doc.getFileName() : "document_" + docId + ".pdf";
    }

    @Override
    @Transactional
    public void deleteDocument(Long docId) {
        if (!documentRepository.existsById(docId)) {
            throw new ResourceNotFoundException("Document introuvable : " + docId);
        }
        documentRepository.deleteById(docId);
    }

    private Marin findMarinOrThrow(Long id) {
        return marinRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Marin introuvable : " + id));
    }

    private Grade resolveGrade(String gradeInput) {
        return gradeRepository.findByLabelIgnoreCase(gradeInput.trim())
                .or(() -> gradeRepository.findByCodeIgnoreCase(gradeInput.trim()))
                .orElseThrow(() -> new BadRequestException("Grade professionnel inconnu : " + gradeInput));
    }

    private MarinDtos.MarinResponse mapFullMarin(Marin m) {
        List<Contrat> contrats = contratRepository.findByMarinIdOrderByStartDateDesc(m.getId());
        List<Absence> absences = absenceRepository.findByMarinIdOrderByStartDateDesc(m.getId());
        List<DocumentAdministratif> docs = documentRepository.findByMarinIdOrderByUploadedAtDesc(m.getId());
        return mapper.toMarinResponse(m, contrats, absences, docs);
    }
}
