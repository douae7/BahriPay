package com.maritime.controller;

import com.maritime.dto.MarinDtos;
import com.maritime.service.MarinService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
public class AbsenceController {

    private final MarinService marinService;

    @GetMapping
    public ResponseEntity<List<MarinDtos.AbsenceDto>> listAbsences(@RequestParam(required = false) Long marinId) {
        return ResponseEntity.ok(marinService.listAbsences(marinId));
    }

    @PostMapping
    public ResponseEntity<MarinDtos.AbsenceDto> createAbsence(@Valid @RequestBody MarinDtos.AbsenceRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marinService.createAbsence(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAbsence(@PathVariable Long id) {
        marinService.deleteAbsence(id);
        return ResponseEntity.noContent().build();
    }
}
