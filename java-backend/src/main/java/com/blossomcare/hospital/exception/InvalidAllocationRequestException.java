package com.blossomcare.hospital.exception;

/**
 * Custom domain exception thrown when a bed allocation or clinical admission request
 * violates hospital rules (e.g., assigning a critical ventilator-dependent patient to
 * a non-ICU general bed without an authorized staff override, or attempting to allocate
 * a bed to an already-admitted or discharged patient).
 */
public class InvalidAllocationRequestException extends RuntimeException {

    private final String patientId;
    private final String bedId;

    public InvalidAllocationRequestException(String message) {
        super(message);
        this.patientId = null;
        this.bedId = null;
    }

    public InvalidAllocationRequestException(String patientId, String bedId, String message) {
        super(message);
        this.patientId = patientId;
        this.bedId = bedId;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getBedId() {
        return bedId;
    }
}
