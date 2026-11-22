package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum AbsenceType {
    CONGE_PAYE("Congé payé"),
    REPOS_COMPENSATEUR("Repos compensateur"),
    MALADIE("Maladie"),
    FORMATION_STCW("Formation STCW");

    private final String label;

    AbsenceType(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static AbsenceType fromValue(String value) {
        if (value == null) return REPOS_COMPENSATEUR;
        String norm = normalize(value);
        for (AbsenceType t : values()) {
            if (normalize(t.name()).equals(norm) || normalize(t.label).equals(norm)) {
                return t;
            }
        }
        throw new IllegalArgumentException("Type d'absence invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
