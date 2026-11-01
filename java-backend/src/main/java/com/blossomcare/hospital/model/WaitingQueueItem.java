package com.blossomcare.hospital.model;

import com.blossomcare.hospital.model.enums.AcuityLevel;
import com.blossomcare.hospital.model.enums.WardType;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Encapsulated domain entity representing a Patient waiting queue entry
 * in the Blossom Care Intelligent Hospital Bed Allocation System.
 */
public class WaitingQueueItem implements Comparable<WaitingQueueItem> {

    private final String id;
    private final String patientId;
    private final String patientName;
    private final int age;
    private final String diagnosis;
    private final AcuityLevel acuity;
    private final int priorityScore;
    private final WardType requiredWardType;
    private final boolean needsVentilator;
    private final boolean needsIsolation;
    private final LocalDateTime requestedAt;
    private final long arrivalSequence;
    private final String requestingDoctor;
    private String notes;

    public WaitingQueueItem(
            String id,
            Patient patient,
            LocalDateTime requestedAt,
            long arrivalSequence,
            String requestingDoctor,
            String notes
    ) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("WaitingQueueItem ID cannot be null or blank.");
        }
        if (patient == null) {
            throw new IllegalArgumentException("Patient cannot be null.");
        }
        this.id = id.trim();
        this.patientId = patient.getId();
        this.patientName = patient.getName();
        this.age = patient.getAge();
        this.diagnosis = patient.getDiagnosis();
        this.acuity = patient.getAcuity();
        this.priorityScore = patient.getPriorityScore();
        this.requiredWardType = patient.getRequiredWardType();
        this.needsVentilator = patient.isNeedsVentilator();
        this.needsIsolation = patient.isNeedsIsolation();
        this.requestedAt = (requestedAt != null) ? requestedAt : LocalDateTime.now();
        this.arrivalSequence = arrivalSequence;
        this.requestingDoctor = (requestingDoctor == null || requestingDoctor.isBlank())
                ? patient.getAttendingDoctor() : requestingDoctor.trim();
        this.notes = (notes == null) ? "" : notes.trim();
    }

    @Override
    public int compareTo(WaitingQueueItem other) {
        int scoreComparison = Integer.compare(other.priorityScore, this.priorityScore);
        if (scoreComparison != 0) {
            return scoreComparison;
        }
        int timeComparison = this.requestedAt.compareTo(other.requestedAt);
        if (timeComparison != 0) {
            return timeComparison;
        }
        return Long.compare(this.arrivalSequence, other.arrivalSequence);
    }

    public String getId() {
        return id;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public int getAge() {
        return age;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public AcuityLevel getAcuity() {
        return acuity;
    }

    public int getPriorityScore() {
        return priorityScore;
    }

    public WardType getRequiredWardType() {
        return requiredWardType;
    }

    public boolean isNeedsVentilator() {
        return needsVentilator;
    }

    public boolean isNeedsIsolation() {
        return needsIsolation;
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public long getArrivalSequence() {
        return arrivalSequence;
    }

    public String getRequestingDoctor() {
        return requestingDoctor;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = (notes == null) ? "" : notes.trim();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof WaitingQueueItem that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
