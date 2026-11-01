package com.blossomcare.hospital.model.enums;

/**
 * Represents clinical acuity classification for patients in the Blossom Care
 * Hospital Bed Allocation System.
 *
 * Each acuity level maps directly to the base clinical priority score used by
 * the hospital's triage and bed allocation engine:
 * - CRITICAL (95): Immediate life-saving intervention or ICU support required
 * - HIGH (82): Acute clinical instability requiring rapid specialty admission
 * - MODERATE (60): Inpatient observation and active medical/surgical management
 * - STABLE (35): Routine inpatient care, recovery, or post-operative monitoring
 */
public enum AcuityLevel {
    CRITICAL("Critical", 95, true),
    HIGH("High", 82, false),
    MODERATE("Moderate", 60, false),
    STABLE("Stable", 35, false);

    private final String displayName;
    private final int basePriorityScore;
    private final boolean requiresIntensiveCareByDefault;

    AcuityLevel(String displayName, int basePriorityScore, boolean requiresIntensiveCareByDefault) {
        this.displayName = displayName;
        this.basePriorityScore = basePriorityScore;
        this.requiresIntensiveCareByDefault = requiresIntensiveCareByDefault;
    }

    public String getDisplayName() {
        return displayName;
    }

    public int getBasePriorityScore() {
        return basePriorityScore;
    }

    public boolean isRequiresIntensiveCareByDefault() {
        return requiresIntensiveCareByDefault;
    }

    /**
     * Parses a display label or enum constant name (case-insensitive) into an AcuityLevel.
     *
     * @param value string representation (e.g., "Critical", "CRITICAL", "High")
     * @return matching AcuityLevel
     * @throws IllegalArgumentException if the string is null, blank, or unrecognized
     */
    public static AcuityLevel fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Acuity level cannot be null or empty.");
        }
        String normalized = value.trim();
        for (AcuityLevel level : values()) {
            if (level.name().equalsIgnoreCase(normalized)
                    || level.displayName.equalsIgnoreCase(normalized)) {
                return level;
            }
        }
        throw new IllegalArgumentException("Unknown AcuityLevel: " + value);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
