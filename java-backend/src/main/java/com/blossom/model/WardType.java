package com.blossom.model;

/**
 * Represents the clinical specialty ward classifications across the Blossom Care hospital campus.
 */
public enum WardType {
    ICU("ICU", "Medical-Surgical Intensive Care Unit", true),
    CARDIAC("Cardiac", "Coronary & Telemetry Care Unit", false),
    SURGICAL("Surgical", "Perioperative & Post-Surgical Recovery Ward", false),
    GENERAL("General", "Acute Internal Medicine & General Inpatient Ward", false),
    PEDIATRICS("Pediatrics", "Pediatric Inpatient & Neonatal Step-Down Ward", false),
    MATERNITY("Maternity", "Obstetrics, Labor & Postpartum Care Suite", false);

    private final String displayName;
    private final String clinicalDescription;
    private final boolean criticalCareUnit;

    WardType(String displayName, String clinicalDescription, boolean criticalCareUnit) {
        this.displayName = displayName;
        this.clinicalDescription = clinicalDescription;
        this.criticalCareUnit = criticalCareUnit;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getClinicalDescription() {
        return clinicalDescription;
    }

    public boolean isCriticalCareUnit() {
        return criticalCareUnit;
    }

    public static WardType fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Ward type cannot be null or blank.");
        }
        String normalized = value.trim();
        for (WardType type : values()) {
            if (type.name().equalsIgnoreCase(normalized)
                    || type.displayName.equalsIgnoreCase(normalized)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unrecognized WardType: " + value);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
