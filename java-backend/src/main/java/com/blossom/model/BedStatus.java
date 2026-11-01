package com.blossom.model;

/**
 * Represents the operational readiness status of a hospital bed.
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

    public boolean isAllocatable() {
        return allocatable;
    }

    public static BedStatus fromString(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Bed status cannot be null or blank.");
        }
        String normalized = value.trim();
        for (BedStatus status : values()) {
            if (status.name().equalsIgnoreCase(normalized)
                    || status.displayName.equalsIgnoreCase(normalized)) {
                return status;
            }
        }
        throw new IllegalArgumentException("Unrecognized BedStatus: " + value);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
