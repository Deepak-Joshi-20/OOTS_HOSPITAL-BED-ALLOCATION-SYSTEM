package com.blossomcare.hospital.exception;

/**
 * Thrown when a requested domain entity (Patient, Bed, Ward, or Admission)
 * cannot be found in the hospital repository/service state.
 */
public class EntityNotFoundException extends RuntimeException {

    private final String entityType;
    private final String entityId;

    public EntityNotFoundException(String entityType, String entityId) {
        super(String.format("%s with ID '%s' was not found in the Blossom Care registry.", entityType, entityId));
        this.entityType = entityType;
        this.entityId = entityId;
    }

    public String getEntityType() {
        return entityType;
    }

    public String getEntityId() {
        return entityId;
    }
}
