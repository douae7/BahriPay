package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

import java.text.Normalizer;

public enum VesselStatus {
    DISPONIBLE("Disponible"),
    EN_MER("En mer"),
    EN_MAINTENANCE("En maintenance");

    private final String label;

    VesselStatus(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static VesselStatus fromValue(String value) {
        if (value == null) return DISPONIBLE;
        String norm = normalize(value);
        for (VesselStatus s : values()) {
            if (normalize(s.name()).equals(norm) || normalize(s.label).equals(norm)) {
                return s;
            }
        }
        throw new IllegalArgumentException("Statut navire invalide : " + value);
    }

    private static String normalize(String s) {
        return Normalizer.normalize(s.trim(), Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toUpperCase()
                .replace(' ', '_');
    }
}
