package com.blossomcare.hospital.model.enums;

/**
 * Represents the operational status of a hospital bed in the Blossom Care platform.
 */
public enum BedStatus {
    AVAILABLE("Available", true),
    OCCUPIED("Occupied", false),
    CLEANING("Cleaning", false),
    MAINTENANCE("Maintenance", false);

    private final String displayName;
    private final boolean allocatable;

    BedStatus(String displayName, boolean allocatable) {
        this.displayName = displayName;
        this.allocatable = allocatable;
    }

    public String getDisplayName() {
        return displayName;
    }

    /**
     * Indicates whether a bed in this state can be assigned to an incoming patient.
     */
    public boolean isAllocatable() {
        return allocatable;
    }

    public static BedStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Bed status cannot be null or empty.");
        }
        String normalized = value.trim();
        for (BedStatus status : values()) {
            if (status.name().equalsIgnoreCase(normalized)
                    || status.displayName.equalsIgnoreCase(normalized)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unknown BedStatus: " + value);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
