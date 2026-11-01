package com.blossom.exception;

/**
 * Custom domain exception thrown when a requested Patient ID cannot be found
 * in the Blossom Care registry.
 */
public class PatientNotFoundException extends RuntimeException {

    private final String patientId;

    public PatientNotFoundException(String patientId) {
        super(String.format("Patient with ID '%s' was not found in the Blossom Care registry.", patientId));
        this.patientId = patientId;
    }

    public String getPatientId() {
        return patientId;
    }
}
