package com.maritime.enums;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum NotificationSeverity {
    INFO("info"),
    WARNING("warning"),
    URGENT("urgent");

    private final String label;

    NotificationSeverity(String label) {
        this.label = label;
    }

    @JsonValue
    public String getLabel() {
        return label;
    }

    @JsonCreator
    public static NotificationSeverity fromValue(String value) {
        if (value == null) return INFO;
        for (NotificationSeverity s : values()) {
            if (s.name().equalsIgnoreCase(value.trim()) || s.label.equalsIgnoreCase(value.trim())) {
                return s;
            }
        }
        return INFO;
    }
}
