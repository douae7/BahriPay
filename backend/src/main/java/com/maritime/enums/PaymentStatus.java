package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum PaymentStatus {
    PAYE("Payé"),
    EN_ATTENTE("En attente");

    private final String label;

    PaymentStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static PaymentStatus fromValue(String value) {
        if (value == null) return EN_ATTENTE;
        String norm = normalize(value);
        for (PaymentStatus p : values()) {
            if (normalize(p.name()).equals(norm) || normalize(p.label).equals(norm)) {
                return p;
            }
        }
        throw new IllegalArgumentException("Statut de paiement invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
