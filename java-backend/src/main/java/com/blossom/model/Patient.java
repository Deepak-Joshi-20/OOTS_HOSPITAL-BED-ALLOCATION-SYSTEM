package com.blossom.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Encapsulated domain entity representing a Patient in the Blossom Care Hospital
 * Bed Allocation System.
 *
 * <p>Demonstrates <b>Encapsulation</b>: all fields are {@code private}, validated through
 * constructors and setter methods, and exposed via controlled accessors.</p>
 */
public class Patient {

    private final String id;
    private String name;
    private int age;
    private String gender;
    private String bloodGroup;
    private String diagnosis;
    private AcuityLevel acuity;
    private WardType requiredWardType;
    private boolean needsVentilator;
    private boolean needsIsolation;
    private int priorityScore;
    private PatientStatus status;
    private String assignedBedId;
    private String attendingDoctor;
    private String emergencyContact;
    private String notes;
    private VitalSigns vitals;
    private LocalDateTime admittedAt;

    public Patient(
            String id,
            String name,
            int age,
            String gender,
            String bloodGroup,
            String diagnosis,
            AcuityLevel acuity,
            WardType requiredWardType,
            boolean needsVentilator,
            boolean needsIsolation,
            String attendingDoctor,
            String emergencyContact,
            String notes,
            VitalSigns vitals
    ) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Patient ID cannot be null or blank.");
        }
        setName(name);
        setAge(age);
        this.id = id.trim();
        this.gender = (gender == null || gender.isBlank()) ? "Unspecified" : gender.trim();
        this.bloodGroup = (bloodGroup == null || bloodGroup.isBlank()) ? "O+" : bloodGroup.trim();
        setDiagnosis(diagnosis);
        setAcuity(acuity);
        setRequiredWardType(requiredWardType);
        this.needsVentilator = needsVentilator;
        this.needsIsolation = needsIsolation;
        this.attendingDoctor = (attendingDoctor == null || attendingDoctor.isBlank())
                ? "Dr. Unassigned" : attendingDoctor.trim();
        this.emergencyContact = (emergencyContact == null) ? "" : emergencyContact.trim();
        this.notes = (notes == null) ? "" : notes.trim();
        this.vitals = (vitals == null) ? VitalSigns.defaultStableVitals() : vitals;
        this.status = PatientStatus.WAITING;
        this.assignedBedId = null;
        this.admittedAt = null;
        this.priorityScore = computeClinicalPriorityScore();
    }

    public Patient(
            String id,
            String name,
            int age,
            String gender,
            String diagnosis,
            AcuityLevel acuity,
            WardType requiredWardType,
            boolean needsVentilator,
            boolean needsIsolation
    ) {
        this(
                id,
                name,
                age,
                gender,
                "O+",
                diagnosis,
                acuity,
                requiredWardType,
                needsVentilator,
                needsIsolation,
                "Dr. Unassigned",
                "N/A",
                "",
                VitalSigns.defaultStableVitals()
        );
    }

    /**
     * Computes the clinical priority score using the Blossom Care triage formula:
     * Base Acuity Score (Critical=95, High=82, Moderate=60, Stable=35) plus clinical
     * modifiers for life-support requirements (capped at 100).
     */
    public final int computeClinicalPriorityScore() {
        int score = acuity.getBasePriorityScore();
        if (needsVentilator) {
            score += 2;
        }
        if (needsIsolation) {
            score += 1;
        }
        if (vitals != null && vitals.indicatesAcuteDistress()) {
            score += 1;
        }
        return Math.min(100, score);
    }

    /**
     * Determines whether this patient clinically requires an Intensive Care Unit (ICU) bed.
     */
    public boolean requiresIntensiveCare() {
        return acuity == AcuityLevel.CRITICAL
                || requiredWardType == WardType.ICU
                || needsVentilator;
    }

    public void markAdmitted(String bedId, LocalDateTime admissionTimestamp) {
        if (bedId == null || bedId.isBlank()) {
            throw new IllegalArgumentException("Assigned bed ID cannot be null or blank upon admission.");
        }
        this.assignedBedId = bedId.trim();
        this.status = PatientStatus.ADMITTED;
        this.admittedAt = (admissionTimestamp != null) ? admissionTimestamp : LocalDateTime.now();
    }

    public void markDischarged() {
        this.assignedBedId = null;
        this.status = PatientStatus.DISCHARGED;
    }

    public void returnToWaitingQueue() {
        this.assignedBedId = null;
        this.status = PatientStatus.WAITING;
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public final void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Patient name cannot be null or empty.");
        }
        this.name = name.trim();
    }

    public int getAge() {
        return age;
    }

    public final void setAge(int age) {
        if (age < 0 || age > 130) {
            throw new IllegalArgumentException("Patient age must be between 0 and 130 years. Provided: " + age);
        }
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        if (gender == null || gender.isBlank()) {
            throw new IllegalArgumentException("Gender cannot be null or empty.");
        }
        this.gender = gender.trim();
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        if (bloodGroup == null || bloodGroup.isBlank()) {
            throw new IllegalArgumentException("Blood group cannot be null or empty.");
        }
        this.bloodGroup = bloodGroup.trim();
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public final void setDiagnosis(String diagnosis) {
        if (diagnosis == null || diagnosis.isBlank()) {
            throw new IllegalArgumentException("Primary clinical diagnosis cannot be null or empty.");
        }
        this.diagnosis = diagnosis.trim();
    }

    public AcuityLevel getAcuity() {
        return acuity;
    }

    public final void setAcuity(AcuityLevel acuity) {
        if (acuity == null) {
            throw new IllegalArgumentException("Patient acuity level cannot be null.");
        }
        this.acuity = acuity;
        this.priorityScore = computeClinicalPriorityScore();
    }

    public WardType getRequiredWardType() {
        return requiredWardType;
    }

    public final void setRequiredWardType(WardType requiredWardType) {
        if (requiredWardType == null) {
            throw new IllegalArgumentException("Required ward specialty cannot be null.");
        }
        this.requiredWardType = requiredWardType;
    }

    public boolean isNeedsVentilator() {
        return needsVentilator;
    }

    public void setNeedsVentilator(boolean needsVentilator) {
        this.needsVentilator = needsVentilator;
        this.priorityScore = computeClinicalPriorityScore();
    }

    public boolean isNeedsIsolation() {
        return needsIsolation;
    }

    public void setNeedsIsolation(boolean needsIsolation) {
        this.needsIsolation = needsIsolation;
        this.priorityScore = computeClinicalPriorityScore();
    }

    public int getPriorityScore() {
        return priorityScore;
    }

    public void setPriorityScore(int priorityScore) {
        if (priorityScore < 1 || priorityScore > 100) {
            throw new IllegalArgumentException("Priority score must be between 1 and 100.");
        }
        this.priorityScore = priorityScore;
    }

    public PatientStatus getStatus() {
        return status;
    }

    public String getAssignedBedId() {
        return assignedBedId;
    }

    public String getAttendingDoctor() {
        return attendingDoctor;
    }

    public void setAttendingDoctor(String attendingDoctor) {
        if (attendingDoctor == null || attendingDoctor.isBlank()) {
            throw new IllegalArgumentException("Attending doctor cannot be blank.");
        }
        this.attendingDoctor = attendingDoctor.trim();
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = (emergencyContact == null) ? "" : emergencyContact.trim();
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = (notes == null) ? "" : notes.trim();
    }

    public VitalSigns getVitals() {
        return vitals;
    }

    public void setVitals(VitalSigns vitals) {
        if (vitals == null) {
            throw new IllegalArgumentException("VitalSigns cannot be null.");
        }
        this.vitals = vitals;
        this.priorityScore = computeClinicalPriorityScore();
    }

    public LocalDateTime getAdmittedAt() {
        return admittedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Patient patient)) return false;
        return Objects.equals(id, patient.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("Patient[%s | %s (%dy, %s) | Acuity=%s (Score=%d) | ReqWard=%s | Vent=%s | Iso=%s | Status=%s | Bed=%s]",
                id, name, age, gender, acuity, priorityScore, requiredWardType,
                needsVentilator, needsIsolation, status, assignedBedId != null ? assignedBedId : "NONE");
    }
}
