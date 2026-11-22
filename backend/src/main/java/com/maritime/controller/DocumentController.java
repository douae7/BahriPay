package com.maritime.controller;

import com.maritime.dto.MarinDtos;
import com.maritime.enums.DocumentStatus;
import com.maritime.service.MarinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final MarinService marinService;

    @GetMapping
    public ResponseEntity<List<MarinDtos.DocumentDto>> listDocuments(@RequestParam Long marinId) {
        return ResponseEntity.ok(marinService.listDocuments(marinId));
    }

    @PostMapping
    public ResponseEntity<MarinDtos.DocumentDto> createDocument(@Valid @RequestBody MarinDtos.DocumentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marinService.createDocumentMetadata(request));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MarinDtos.DocumentDto> uploadDocument(
            @RequestParam Long marinId,
            @RequestParam(required = false) String name,
            @RequestParam(required = false, defaultValue = "CERTIFICAT") String documentType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(marinService.uploadDocument(marinId, name, documentType, expiryDate, file));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<MarinDtos.DocumentDto> updateStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload
    ) {
        DocumentStatus status = DocumentStatus.fromValue(payload.get("status"));
        return ResponseEntity.ok(marinService.updateDocumentStatus(id, status));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(@PathVariable Long id) {
        Resource resource = marinService.loadDocumentResource(id);
        String filename = marinService.getDocumentFileName(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDocument(@PathVariable Long id) {
        marinService.deleteDocument(id);
        return ResponseEntity.noContent().build();
    }
}
