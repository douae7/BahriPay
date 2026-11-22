package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum SailorStatus {
    ACTIF("Actif"),
    EN_MER("En mer"),
    EN_CONGE("En congé"),
    REPOS("Repos");

    private final String label;

    SailorStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static SailorStatus fromValue(String value) {
        if (value == null) return ACTIF;
        String norm = normalize(value);
        for (SailorStatus s : values()) {
            if (normalize(s.name()).equals(norm) || normalize(s.label).equals(norm)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Statut marin invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
