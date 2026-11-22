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
@RequestMapping("/api/productions")
@RequiredArgsConstructor
public class ProductionController {

    private final FlotteService flotteService;

    @GetMapping
    public ResponseEntity<List<FlotteDtos.ProductionDto>> listProductions(
            @RequestParam(required = false) Long sortieId
    ) {
        return ResponseEntity.ok(flotteService.listProductions(sortieId));
    }

    @PostMapping
    public ResponseEntity<FlotteDtos.ProductionDto> addProduction(
            @Valid @RequestBody FlotteDtos.ProductionCreateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(flotteService.addProduction(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduction(@PathVariable Long id) {
        flotteService.deleteProduction(id);
        return ResponseEntity.noContent().build();
    }
}
