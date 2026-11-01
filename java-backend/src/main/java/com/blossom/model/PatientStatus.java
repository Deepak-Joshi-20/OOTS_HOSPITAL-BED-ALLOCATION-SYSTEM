package com.blossom.model;

/**
 * Represents the clinical lifecycle state of a patient in the Blossom Care platform.
 */
public enum PatientStatus {
    WAITING("Waiting"),
    ADMITTED("Admitted"),
    DISCHARGED("Discharged");

    private final String displayName;

    PatientStatus(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }

    @Override
    public String toString() {
        return displayName;
    }
}
