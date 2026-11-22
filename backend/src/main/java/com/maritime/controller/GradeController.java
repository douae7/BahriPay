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
@RequestMapping("/api/grades")
@RequiredArgsConstructor
public class GradeController {

    private final MarinService marinService;

    @GetMapping
    public ResponseEntity<List<MarinDtos.GradeDto>> listGrades() {
        return ResponseEntity.ok(marinService.listGrades());
    }

    @PostMapping
    public ResponseEntity<MarinDtos.GradeDto> createGrade(@Valid @RequestBody MarinDtos.GradeDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(marinService.createGrade(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MarinDtos.GradeDto> updateGrade(
            @PathVariable Long id,
            @Valid @RequestBody MarinDtos.GradeDto request
    ) {
        return ResponseEntity.ok(marinService.updateGrade(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        marinService.deleteGrade(id);
        return ResponseEntity.noContent().build();
    }
}
