package com.blossom.exception;

/**
 * Custom domain exception thrown when a bed allocation request violates clinical
 * suitability rules or domain state invariants (for example: assigning a critical
 * ventilator-dependent patient to a general ward bed without an authorized staff
 * override, or attempting to allocate a bed to a patient who is already admitted
 * or discharged).
 */
public class InvalidAllocationRequestException extends RuntimeException {

    private final String patientId;
    private final String bedNumber;

    public InvalidAllocationRequestException(String message) {
        super(message);
        this.patientId = null;
        this.bedNumber = null;
    }

    public InvalidAllocationRequestException(String patientId, String bedNumber, String reason) {
        super(String.format(
                "Invalid bed allocation request [Patient=%s, Bed=%s]: %s",
                patientId, bedNumber, reason
        ));
        this.patientId = patientId;
        this.bedNumber = bedNumber;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getBedNumber() {
        return bedNumber;
    }
}
