package com.maritime.controller;

import com.maritime.dto.FinanceDtos;
import com.maritime.service.FinanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/paiements")
@RequiredArgsConstructor
public class PaiementController {

    private final FinanceService financeService;

    @GetMapping
    public ResponseEntity<List<FinanceDtos.PaiementResponse>> listPaiements() {
        return ResponseEntity.ok(financeService.listPaiements());
    }

    @GetMapping("/regle-repartition")
    public ResponseEntity<FinanceDtos.RegleRepartitionDto> getShareRule() {
        return ResponseEntity.ok(financeService.getActiveShareRule());
    }

    @PutMapping("/regle-repartition")
    public ResponseEntity<FinanceDtos.RegleRepartitionDto> updateShareRule(
            @Valid @RequestBody FinanceDtos.RegleRepartitionDto request,
            Authentication authentication
    ) {
        String email = authentication != null ? authentication.getName() : "system@bahripay-armement.fr";
        return ResponseEntity.ok(financeService.updateShareRule(request, email));
    }

    @PostMapping("/generer/{sortieId}")
    public ResponseEntity<List<FinanceDtos.PaiementResponse>> generateTripPayments(
            @PathVariable Long sortieId,
            Authentication authentication
    ) {
        String issuer = authentication != null ? authentication.getName() : "Armement Bahripay";
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(financeService.generateTripPayments(sortieId, issuer));
    }

    @PatchMapping("/{id}/payer")
    public ResponseEntity<FinanceDtos.PaiementResponse> markPaid(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.markPaymentPaid(id));
    }

    @GetMapping("/{id}/fiche")
    public ResponseEntity<FinanceDtos.FichePaiementResponse> getPaymentSlip(@PathVariable Long id) {
        return ResponseEntity.ok(financeService.getPaymentSlip(id));
    }
}
