package com.maritime.controller;

import com.maritime.dto.FlotteDtos;
import com.maritime.service.FlotteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/especes")
@RequiredArgsConstructor
public class EspeceController {

    private final FlotteService flotteService;

    @GetMapping
    public ResponseEntity<List<FlotteDtos.EspeceDto>> listEspeces() {
        return ResponseEntity.ok(flotteService.listEspeces());
    }

    @PostMapping
    public ResponseEntity<FlotteDtos.EspeceDto> createEspece(@Valid @RequestBody FlotteDtos.EspeceDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flotteService.createEspece(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlotteDtos.EspeceDto> updateEspece(
            @PathVariable Long id,
            @Valid @RequestBody FlotteDtos.EspeceDto request
    ) {
        return ResponseEntity.ok(flotteService.updateEspece(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEspece(@PathVariable Long id) {
        flotteService.deleteEspece(id);
        return ResponseEntity.noContent().build();
    }
}
