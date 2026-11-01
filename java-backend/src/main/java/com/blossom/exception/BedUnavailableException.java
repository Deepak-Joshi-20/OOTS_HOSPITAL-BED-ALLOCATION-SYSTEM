package com.blossom.exception;

import com.blossom.model.BedStatus;

/**
 * Custom domain exception thrown when an allocation request targets a hospital bed
 * that is not in {@link BedStatus#AVAILABLE} status (e.g., {@code OCCUPIED},
 * {@code CLEANING}, or {@code MAINTENANCE}).
 */
public class BedUnavailableException extends RuntimeException {

    private final String bedNumber;
    private final BedStatus currentStatus;

    public BedUnavailableException(String bedNumber, BedStatus currentStatus) {
        super(String.format(
                "Bed '%s' is unavailable for patient allocation (Current Status: %s). Only AVAILABLE beds can be assigned.",
                bedNumber,
                currentStatus != null ? currentStatus.getDisplayName() : "UNKNOWN"
        ));
        this.bedNumber = bedNumber;
        this.currentStatus = currentStatus;
    }

    public BedUnavailableException(String message) {
        super(message);
        this.bedNumber = "UNKNOWN";
        this.currentStatus = null;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public BedStatus getCurrentStatus() {
        return currentStatus;
    }
}
