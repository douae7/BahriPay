package com.maritime.controller;

import com.maritime.dto.FinanceDtos;
import com.maritime.service.FinanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ventes")
@RequiredArgsConstructor
public class VenteController {

    private final FinanceService financeService;

    @GetMapping
    public ResponseEntity<List<FinanceDtos.VenteResponse>> listVentes() {
        return ResponseEntity.ok(financeService.listVentes());
    }

    @PostMapping
    public ResponseEntity<FinanceDtos.VenteResponse> createVente(@Valid @RequestBody FinanceDtos.VenteRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financeService.createVente(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVente(@PathVariable Long id) {
        financeService.deleteVente(id);
        return ResponseEntity.noContent().build();
    }
}
