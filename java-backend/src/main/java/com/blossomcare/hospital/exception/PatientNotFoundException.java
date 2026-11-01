package com.blossomcare.hospital.exception;

/**
 * Custom domain exception thrown when a Patient ID or MRN cannot be found
 * in the Blossom Care hospital registry.
 */
public class PatientNotFoundException extends EntityNotFoundException {

    public PatientNotFoundException(String patientId) {
        super("Patient", patientId);
    }
}
