package com.blossomcare.hospital.model;

import com.blossomcare.hospital.exception.BedUnavailableException;
import com.blossomcare.hospital.model.enums.BedStatus;
import com.blossomcare.hospital.model.enums.WardType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;

/**
 * Abstract base class representing a hospital bed in the Blossom Care platform.
 *
 * <p>Demonstrates core Object-Oriented Programming principles:</p>
 * <ul>
 *   <li><b>Abstraction</b>: Defines the common state and contract for all hospital beds
 *       while delegating specialized suitability evaluation to concrete subclasses.</li>
 *   <li><b>Inheritance</b>: Extended by {@link ICUBed} and {@link GeneralBed}.</li>
 *   <li><b>Polymorphism</b>: Subclasses override {@link #isSuitableFor(Patient)},
 *       {@link #calculateSuitabilityScore(Patient)}, and {@link #getBedCategory()} to
 *       provide specialized clinical behavior at runtime.</li>
 *   <li><b>Encapsulation</b>: Protects bed status and patient assignment invariants.</li>
 * </ul>
 */
public abstract class Bed {

    private final String id;
    private final String bedNumber;
    private final String wardId;
    private final String wardName;
    private final WardType wardType;
    private final int floor;
    private BedStatus status;
    private String patientId;
    private final boolean hasVentilator;
    private final boolean hasTelemetry;
    private final boolean isolationCapable;
    private final double dailyRateUsd;
    private LocalDateTime lastCleanedAt;
    private final List<String> equipment;

    protected Bed(
            String id,
            String bedNumber,
            String wardId,
            String wardName,
            WardType wardType,
            int floor,
            BedStatus status,
            boolean hasVentilator,
            boolean hasTelemetry,
            boolean isolationCapable,
            double dailyRateUsd,
            List<String> equipment
    ) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Bed ID cannot be null or blank.");
        }
        if (bedNumber == null || bedNumber.isBlank()) {
            throw new IllegalArgumentException("Bed number cannot be null or blank.");
        }
        if (wardId == null || wardId.isBlank()) {
            throw new IllegalArgumentException("Ward ID cannot be null or blank.");
        }
        if (wardName == null || wardName.isBlank()) {
            throw new IllegalArgumentException("Ward name cannot be null or blank.");
        }
        if (wardType == null) {
            throw new IllegalArgumentException("Ward type cannot be null.");
        }
        if (floor < 1 || floor > 50) {
            throw new IllegalArgumentException("Hospital floor must be between 1 and 50.");
        }
        if (dailyRateUsd < 0) {
            throw new IllegalArgumentException("Daily bed rate cannot be negative.");
        }
        this.id = id.trim();
        this.bedNumber = bedNumber.trim();
        this.wardId = wardId.trim();
        this.wardName = wardName.trim();
        this.wardType = wardType;
        this.floor = floor;
        this.status = (status == null) ? BedStatus.AVAILABLE : status;
        this.patientId = null;
        this.hasVentilator = hasVentilator;
        this.hasTelemetry = hasTelemetry;
        this.isolationCapable = isolationCapable;
        this.dailyRateUsd = dailyRateUsd;
        this.lastCleanedAt = LocalDateTime.now();
        this.equipment = (equipment == null) ? new ArrayList<>() : new ArrayList<>(equipment);
    }

    // --- Polymorphic Contract Methods ---

    /**
     * Polymorphically determines whether this bed is clinically suitable for the given patient
     * under standard (non-override) hospital allocation rules.
     *
     * @param patient the patient being evaluated for placement
     * @return {@code true} if the bed meets the patient's mandatory clinical requirements
     */
    public abstract boolean isSuitableFor(Patient patient);

    /**
     * Polymorphically computes a numeric suitability compatibility score for ranking
     * candidate beds for a specific patient.
     *
     * <p>Incorporates the core Blossom Care scoring rubric:</p>
     * <ul>
     *   <li>+50 points: Ward specialty matches patient's required ward type</li>
     *   <li>+25 points: Bed has ventilator and patient requires mechanical ventilation</li>
     *   <li>+20 points: Bed is isolation-capable and patient requires isolation</li>
     *   <li>Plus subclass-specific clinical equipment adjustments</li>
     * </ul>
     *
     * @param patient the patient being evaluated
     * @return compatibility score (higher indicates stronger clinical match)
     */
    public abstract int calculateSuitabilityScore(Patient patient);

    /**
     * Returns the specialized bed category label (e.g., "Intensive Care Unit (ICU) Bed"
     * or "Specialty / General Inpatient Bed").
     */
    public abstract String getBedCategory();

    /**
     * Computes the foundational Blossom Care compatibility score shared across all beds:
     * +50 for matching ward type, +25 for matching ventilator need, +20 for matching isolation need.
     */
    protected int computeBaseCompatibilityScore(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient cannot be null when computing compatibility score.");
        }
        int score = 0;
        if (this.wardType == patient.getRequiredWardType()) {
            score += 50;
        }
        if (patient.isNeedsVentilator() && this.hasVentilator) {
            score += 25;
        }
        if (patient.isNeedsIsolation() && this.isolationCapable) {
            score += 20;
        }
        return score;
    }

    // --- State Management & Encapsulated Operations ---

    public boolean isAvailable() {
        return this.status == BedStatus.AVAILABLE && this.patientId == null;
    }

    /**
     * Assigns a patient to this bed and transitions the bed to {@link BedStatus#OCCUPIED}.
     *
     * @param patientId unique ID of the admitted patient
     * @throws BedUnavailableException if the bed is not currently {@code AVAILABLE}
     */
    public void assignPatient(String patientId) {
        if (patientId == null || patientId.isBlank()) {
            throw new IllegalArgumentException("Patient ID cannot be null or blank when assigning to a bed.");
        }
        if (!isAvailable()) {
            throw new BedUnavailableException(this.bedNumber, this.status);
        }
        this.patientId = patientId.trim();
        this.status = BedStatus.OCCUPIED;
    }

    /**
     * Releases the bed upon patient discharge and sets its post-discharge status
     * (typically {@link BedStatus#CLEANING} for terminal sanitization or {@link BedStatus#AVAILABLE}).
     *
     * @param postDischargeStatus target status after releasing the patient
     */
    public void releaseBed(BedStatus postDischargeStatus) {
        if (postDischargeStatus == BedStatus.OCCUPIED) {
            throw new IllegalArgumentException("Cannot release a bed into OCCUPIED status.");
        }
        this.patientId = null;
        this.status = (postDischargeStatus != null) ? postDischargeStatus : BedStatus.CLEANING;
        if (this.status == BedStatus.AVAILABLE) {
            this.lastCleanedAt = LocalDateTime.now();
        }
    }

    /**
     * Marks a bed as sanitized and ready for immediate allocation.
     */
    public void completeSanitization() {
        if (this.status == BedStatus.OCCUPIED) {
            throw new IllegalStateException("Cannot mark an occupied bed as sanitized while a patient is assigned.");
        }
        this.patientId = null;
        this.status = BedStatus.AVAILABLE;
        this.lastCleanedAt = LocalDateTime.now();
    }

    /**
     * Updates operational bed status (e.g., placing an unoccupied bed into Maintenance or Cleaning).
     */
    public void updateOperationalStatus(BedStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("New bed status cannot be null.");
        }
        if (this.status == BedStatus.OCCUPIED && newStatus != BedStatus.OCCUPIED) {
            throw new IllegalStateException(
                    "Bed " + bedNumber + " is currently occupied by patient " + patientId
                            + ". Discharge the patient before changing bed status.");
        }
        this.status = newStatus;
        if (newStatus == BedStatus.AVAILABLE) {
            this.lastCleanedAt = LocalDateTime.now();
        }
    }

    // --- Getters ---

    public String getId() {
        return id;
    }

    public String getBedNumber() {
        return bedNumber;
    }

    public String getWardId() {
        return wardId;
    }

    public String getWardName() {
        return wardName;
    }

    public WardType getWardType() {
        return wardType;
    }

    public int getFloor() {
        return floor;
    }

    public BedStatus getStatus() {
        return status;
    }

    public String getPatientId() {
        return patientId;
    }

    public boolean isHasVentilator() {
        return hasVentilator;
    }

    public boolean isHasTelemetry() {
        return hasTelemetry;
    }

    public boolean isIsolationCapable() {
        return isolationCapable;
    }

    public double getDailyRateUsd() {
        return dailyRateUsd;
    }

    public LocalDateTime getLastCleanedAt() {
        return lastCleanedAt;
    }

    public List<String> getEquipment() {
        return Collections.unmodifiableList(equipment);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Bed bed)) return false;
        return Objects.equals(id, bed.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("%s[%s (%s) | Ward=%s (%s) | Status=%s | Vent=%s | Iso=%s | Patient=%s]",
                getClass().getSimpleName(), bedNumber, id, wardName, wardType,
                status, hasVentilator, isolationCapable, patientId != null ? patientId : "EMPTY");
    }
}
