package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum ContractType {
    A_LA_PART("À la part"),
    CDI_MARITIME("CDI Maritime"),
    CDD_SAISONNIER("CDD Saisonnier");

    private final String label;

    ContractType(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static ContractType fromValue(String value) {
        if (value == null) return A_LA_PART;
        String norm = normalize(value);
        for (ContractType c : values()) {
            if (normalize(c.name()).equals(norm) || normalize(c.label).equals(norm)) {
                return c;
            }
        }
        throw new IllegalArgumentException("Type de contrat invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
