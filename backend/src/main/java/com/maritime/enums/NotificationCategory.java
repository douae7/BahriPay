package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationCategory {
    PAIEMENT("paiement"),
    SORTIE("sortie"),
    CONTRAT("contrat"),
    DOCUMENT("document"),
    FINANCE("finance"),
    IA("ia");

    private final String label;

    NotificationCategory(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static NotificationCategory fromValue(String value) {
        if (value == null) return SORTIE;
        for (NotificationCategory c : values()) {
            if (c.name().equalsIgnoreCase(value.trim()) || c.label.equalsIgnoreCase(value.trim())) {
                return c;
            }
        }
        return SORTIE;
    }
}
