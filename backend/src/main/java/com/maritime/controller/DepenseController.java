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
@RequestMapping("/api/depenses")
@RequiredArgsConstructor
public class DepenseController {

    private final FinanceService financeService;

    @GetMapping
    public ResponseEntity<List<FinanceDtos.DepenseResponse>> listDepenses() {
        return ResponseEntity.ok(financeService.listDepenses());
    }

    @PostMapping
    public ResponseEntity<FinanceDtos.DepenseResponse> createDepense(
            @Valid @RequestBody FinanceDtos.DepenseRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(financeService.createDepense(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDepense(@PathVariable Long id) {
        financeService.deleteDepense(id);
        return ResponseEntity.noContent().build();
    }
}
