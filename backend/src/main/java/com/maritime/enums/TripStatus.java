package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum TripStatus {
    EN_COURS("En cours"),
    TERMINEE("Terminée"),
    PLANIFIEE("Planifiée");

    private final String label;

    TripStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static TripStatus fromValue(String value) {
        if (value == null) return PLANIFIEE;
        String norm = normalize(value);
        for (TripStatus s : values()) {
            if (normalize(s.name()).equals(norm) || normalize(s.label).equals(norm)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Statut sortie de pêche invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
