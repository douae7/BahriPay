package com.maritime.service;

import com.maritime.dto.MarinDtos;
import com.maritime.enums.DocumentStatus;
import com.maritime.enums.SailorStatus;
import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;

public interface MarinService {
    List<MarinDtos.MarinResponse> searchMarins(String search, String grade, SailorStatus status);
    MarinDtos.MarinResponse getMarin(Long id);
    MarinDtos.MarinResponse createMarin(MarinDtos.MarinRequest request);
    MarinDtos.MarinResponse updateMarin(Long id, MarinDtos.MarinRequest request);
    void deleteMarin(Long id);

    List<MarinDtos.GradeDto> listGrades();
    MarinDtos.GradeDto createGrade(MarinDtos.GradeDto request);
    MarinDtos.GradeDto updateGrade(Long id, MarinDtos.GradeDto request);
    void deleteGrade(Long id);

    List<MarinDtos.ContratDto> listContrats(Long marinId);
    MarinDtos.ContratDto createContrat(MarinDtos.ContratRequest request);
    MarinDtos.ContratDto updateContrat(Long id, MarinDtos.ContratRequest request);
    void deleteContrat(Long id);

    List<MarinDtos.AbsenceDto> listAbsences(Long marinId);
    MarinDtos.AbsenceDto createAbsence(MarinDtos.AbsenceRequest request);
    void deleteAbsence(Long id);

    List<MarinDtos.DocumentDto> listDocuments(Long marinId);
    MarinDtos.DocumentDto createDocumentMetadata(MarinDtos.DocumentRequest request);
    MarinDtos.DocumentDto uploadDocument(Long marinId, String name, String documentType, LocalDate expiryDate, MultipartFile file);
    MarinDtos.DocumentDto updateDocumentStatus(Long docId, DocumentStatus status);
    Resource loadDocumentResource(Long docId);
    String getDocumentFileName(Long docId);
    void deleteDocument(Long docId);
}
