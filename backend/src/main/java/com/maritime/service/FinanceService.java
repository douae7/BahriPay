package com.maritime.service;

import com.maritime.dto.FinanceDtos;

import java.util.List;

public interface FinanceService {
    List<FinanceDtos.VenteResponse> listVentes();
    FinanceDtos.VenteResponse createVente(FinanceDtos.VenteRequest request);
    void deleteVente(Long id);

    List<FinanceDtos.DepenseResponse> listDepenses();
    FinanceDtos.DepenseResponse createDepense(FinanceDtos.DepenseRequest request);
    void deleteDepense(Long id);

    FinanceDtos.RegleRepartitionDto getActiveShareRule();
    FinanceDtos.RegleRepartitionDto updateShareRule(FinanceDtos.RegleRepartitionDto request, String actorEmail);

    List<FinanceDtos.PaiementResponse> listPaiements();
    List<FinanceDtos.PaiementResponse> generateTripPayments(Long sortieId, String issuerName);
    FinanceDtos.PaiementResponse markPaymentPaid(Long paymentId);
    FinanceDtos.FichePaiementResponse getPaymentSlip(Long paymentId);
}
