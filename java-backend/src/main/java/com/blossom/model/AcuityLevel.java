package com.blossom.model;

/**
 * Represents clinical acuity classification for patients in the Blossom Care
 * Hospital Bed Allocation System.
 *
 * <ul>
 *   <li>{@link #CRITICAL} (Base priority score: 95) — Immediate life-saving intervention / ICU required</li>
 *   <li>{@link #HIGH} (Base priority score: 82) — Acute instability requiring rapid specialty admission</li>
 *   <li>{@link #MODERATE} (Base priority score: 60) — Active medical or post-surgical inpatient care</li>
 *   <li>{@link #STABLE} (Base priority score: 35) — Routine inpatient observation or recovery</li>
 * </ul>
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

    public static AcuityLevel fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Acuity level cannot be null or blank.");
        }
        String normalized = value.trim();
        for (AcuityLevel level : values()) {
            if (level.name().equalsIgnoreCase(normalized)
                    || level.displayName.equalsIgnoreCase(normalized)) {
                return level;
            }
        }
        throw new IllegalArgumentException("Unrecognized AcuityLevel: " + value);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
