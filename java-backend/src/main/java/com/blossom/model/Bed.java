package com.blossom.model;

import com.blossom.exception.BedUnavailableException;
import com.blossom.exception.InvalidAllocationRequestException;

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
 *   <li><b>Abstraction</b>: Defines the common state ({@code id}, {@code wardId}, {@code isOccupied})
 *       and contract for all hospital beds while delegating specialized suitability evaluation
 *       to concrete subclasses.</li>
 *   <li><b>Inheritance</b>: Extended by {@link ICUBed} and {@link GeneralBed}.</li>
 *   <li><b>Polymorphism</b>: Subclasses override {@link #isSuitableFor(Patient)},
 *       {@link #calculateSuitabilityScore(Patient)}, and {@link #getBedCategory()} to
 *       provide specialized clinical behavior at runtime.</li>
 *   <li><b>Encapsulation</b>: Protects {@code isOccupied}, {@code status}, and {@code patientId}
 *       invariants through private fields and validated state transitions.</li>
 * </ul>
 */
public abstract class Bed {

    private final String id;
    private final String bedNumber;
    private final String wardId;
    private final String wardName;
    private final WardType wardType;
    private final int floor;
    private boolean isOccupied;
    private BedStatus status;
    private String patientId;
    private final boolean hasVentilator;
    private final boolean hasTelemetry;
    private final boolean isolationCapable;
    private final double dailyRateUsd;
    private LocalDateTime lastCleanedAt;
    private final List<String> equipment;

    /**
     * Concise constructor initializing core encapsulated attributes {@code id}, {@code wardId},
     * and {@code isOccupied} along with ward type.
     */
    protected Bed(String id, String wardId, WardType wardType, boolean isOccupied, boolean hasVentilator, boolean isolationCapable) {
        this(
                id,
                id,
                wardId,
                wardType != null ? wardType.getDisplayName() : "General Ward",
                wardType != null ? wardType : WardType.GENERAL,
                1,
                isOccupied ? BedStatus.OCCUPIED : BedStatus.AVAILABLE,
                hasVentilator,
                wardType == WardType.ICU || wardType == WardType.CARDIAC,
                isolationCapable,
                wardType == WardType.ICU ? 3200.0 : 1100.0,
                new ArrayList<>()
        );
        this.isOccupied = isOccupied;
    }

    /**
     * Full domain constructor for hospital bed initialization.
     */
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
        this.isOccupied = (this.status == BedStatus.OCCUPIED);
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
     */
    public abstract boolean isSuitableFor(Patient patient);

    /**
     * Polymorphically computes a numeric suitability compatibility score for ranking
     * candidate beds for a specific patient (+50 ward match, +25 ventilator match,
     * +20 isolation match, plus subclass-specific adjustments).
     */
    public abstract int calculateSuitabilityScore(Patient patient);

    /**
     * Returns the specialized bed category label.
     */
    public abstract String getBedCategory();

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

    // --- Encapsulated State Transitions ---

    public boolean isAvailable() {
        return !this.isOccupied && this.status == BedStatus.AVAILABLE && this.patientId == null;
    }

    public boolean isOccupied() {
        return this.isOccupied;
    }

    /**
     * Encapsulated state mutator that updates occupancy while maintaining internal status consistency.
     */
    protected void setOccupied(boolean occupied) {
        this.isOccupied = occupied;
        if (occupied) {
            this.status = BedStatus.OCCUPIED;
        } else if (this.status == BedStatus.OCCUPIED) {
            this.status = BedStatus.AVAILABLE;
            this.patientId = null;
        }
    }

    public void assignPatient(String patientId) {
        if (patientId == null || patientId.isBlank()) {
            throw new InvalidAllocationRequestException(
                    "Patient ID cannot be null or blank when assigning to a bed."
            );
        }
        if (!isAvailable()) {
            throw new BedUnavailableException(this.bedNumber, this.status);
        }
        this.patientId = patientId.trim();
        this.isOccupied = true;
        this.status = BedStatus.OCCUPIED;
    }

    public void releaseBed() {
        releaseBed(BedStatus.CLEANING);
    }

    public void releaseBed(BedStatus postDischargeStatus) {
        if (postDischargeStatus == BedStatus.OCCUPIED) {
            throw new InvalidAllocationRequestException(
                    "Cannot release a bed into OCCUPIED status."
            );
        }
        this.patientId = null;
        this.isOccupied = false;
        this.status = (postDischargeStatus != null) ? postDischargeStatus : BedStatus.CLEANING;
        if (this.status == BedStatus.AVAILABLE) {
            this.lastCleanedAt = LocalDateTime.now();
        }
    }

    public void completeSanitization() {
        if (this.isOccupied || this.status == BedStatus.OCCUPIED) {
            throw new IllegalStateException("Cannot mark an occupied bed as sanitized while a patient is assigned.");
        }
        this.patientId = null;
        this.isOccupied = false;
        this.status = BedStatus.AVAILABLE;
        this.lastCleanedAt = LocalDateTime.now();
    }

    public void updateOperationalStatus(BedStatus newStatus) {
        if (newStatus == null) {
            throw new IllegalArgumentException("New bed status cannot be null.");
        }
        if (this.isOccupied && newStatus != BedStatus.OCCUPIED) {
            throw new IllegalStateException(
                    "Bed " + bedNumber + " is currently occupied by patient " + patientId
                            + ". Discharge the patient before changing bed status.");
        }
        this.status = newStatus;
        this.isOccupied = (newStatus == BedStatus.OCCUPIED);
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
        return String.format("%s[%s (%s) | Ward=%s (%s) | Occupied=%s | Status=%s | Vent=%s | Iso=%s | Patient=%s]",
                getClass().getSimpleName(), bedNumber, id, wardName, wardType,
                isOccupied, status, hasVentilator, isolationCapable, patientId != null ? patientId : "EMPTY");
    }
}
