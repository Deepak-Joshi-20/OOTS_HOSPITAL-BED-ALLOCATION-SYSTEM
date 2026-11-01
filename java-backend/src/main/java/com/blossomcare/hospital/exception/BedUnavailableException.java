package com.blossomcare.hospital.exception;

import com.blossomcare.hospital.model.enums.BedStatus;

/**
 * Custom checked/runtime domain exception thrown when an attempt is made to allocate
 * a bed that is not currently in the {@link BedStatus#AVAILABLE} state (for example,
 * when it is already {@code OCCUPIED}, undergoing {@code CLEANING}, or in {@code MAINTENANCE}).
 */
public class BedUnavailableException extends RuntimeException {

    private final String bedId;
    private final BedStatus currentStatus;

    public BedUnavailableException(String bedId, BedStatus currentStatus, String message) {
        super(message);
        this.bedId = bedId;
        this.currentStatus = currentStatus;
    }

    public BedUnavailableException(String bedId, BedStatus currentStatus) {
        this(
                bedId,
                currentStatus,
                String.format("Bed '%s' cannot be allocated because its current status is %s.",
                        bedId, currentStatus != null ? currentStatus.getDisplayName() : "UNKNOWN")
        );
    }

    public String getBedId() {
        return bedId;
    }

    public BedStatus getCurrentStatus() {
        return currentStatus;
    }
}
