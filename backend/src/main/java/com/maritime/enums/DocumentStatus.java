package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum DocumentStatus {
    VALIDE("Valide"),
    MANQUANT("Manquant"),
    A_RENOUVELER("À renouveler");

    private final String label;

    DocumentStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static DocumentStatus fromValue(String value) {
        if (value == null) return VALIDE;
        String norm = normalize(value);
        for (DocumentStatus s : values()) {
            if (normalize(s.name()).equals(norm) || normalize(s.label).equals(norm)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Statut de document invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
