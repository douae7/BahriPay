package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum ExpenseCategory {
    CARBURANT("Carburant"),
    GLACE("Glace"),
    NOURRITURE("Nourriture"),
    ENTRETIEN("Entretien"),
    AUTRES("Autres");

    private final String label;

    ExpenseCategory(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ExpenseCategory fromValue(String value) {
        if (value == null) return AUTRES;
        String norm = normalize(value);
        for (ExpenseCategory c : values()) {
            if (normalize(c.name()).equals(norm) || normalize(c.label).equals(norm)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Catégorie de dépense invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
