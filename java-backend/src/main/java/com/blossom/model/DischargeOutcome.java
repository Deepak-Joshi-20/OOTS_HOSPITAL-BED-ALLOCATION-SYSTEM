package com.blossom.model;

/**
 * Represents the clinical disposition outcome when a patient is discharged from an inpatient bed.
 */
public enum DischargeOutcome {
    RECOVERED_HOME("Recovered · Home"),
    TRANSFERRED_REHAB("Transferred · Rehab"),
    OUTPATIENT_FOLLOW_UP("Outpatient Follow-up");

    private final String displayName;

    DischargeOutcome(String displayName) {
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
