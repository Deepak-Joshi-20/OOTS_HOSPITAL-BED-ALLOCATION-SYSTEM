package com.blossomcare.hospital.model;

import com.blossomcare.hospital.model.enums.BedStatus;
import com.blossomcare.hospital.model.enums.WardType;

import java.util.List;

/**
 * Concrete subclass of {@link Bed} representing a non-ICU specialty or general ward bed
 * (e.g., General Medicine, Cardiac Telemetry, Surgical Recovery, Pediatrics, or Maternity).
 *
 * <p>Demonstrates <b>Inheritance</b> and <b>Polymorphism</b>: overrides
 * {@link #isSuitableFor(Patient)} and {@link #calculateSuitabilityScore(Patient)} to
 * enforce clinical safety rules—specifically preventing critical or ventilator-dependent
 * patients from being placed in a general ward bed without an explicit staff override.</p>
 */
public class GeneralBed extends Bed {

    private final String wingSection;
    private final boolean stepDownTelemetryCapable;

    public GeneralBed(
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
            List<String> equipment,
            String wingSection
    ) {
        super(
                id,
                bedNumber,
                wardId,
                wardName,
                wardType,
                floor,
                status,
                hasVentilator,
                hasTelemetry,
                isolationCapable,
                dailyRateUsd,
                equipment
        );
        if (wardType == WardType.ICU) {
            throw new IllegalArgumentException("GeneralBed cannot have WardType.ICU; instantiate ICUBed instead.");
        }
        this.wingSection = (wingSection == null || wingSection.isBlank()) ? "Main Wing" : wingSection.trim();
        this.stepDownTelemetryCapable = hasTelemetry;
    }

    /**
     * Convenience constructor for creating a standard General/Specialty ward bed.
     */
    public GeneralBed(
            String id,
            String bedNumber,
            String wardId,
            String wardName,
            WardType wardType,
            int floor,
            BedStatus status,
            boolean hasTelemetry,
            boolean isolationCapable
    ) {
        this(
                id,
                bedNumber,
                wardId,
                wardName,
                wardType,
                floor,
                status,
                false,
                hasTelemetry,
                isolationCapable,
                wardType == WardType.CARDIAC ? 2100.0 : (wardType == WardType.SURGICAL ? 1850.0 : 1100.0),
                hasTelemetry
                        ? List.of("12-Lead Wireless Telemetry", "Smart Bedside Monitor", "Infusion Pump")
                        : List.of("Vital Signs Monitor", "Adjustable Patient Bed", "Nurse Call System"),
                "East Pavilion"
        );
    }

    /**
     * Polymorphic suitability check for General/Specialty beds:
     * <ul>
     *   <li>A patient who requires Intensive Care ({@code CRITICAL} acuity, {@code WardType.ICU},
     *       or mechanical ventilation) is NOT suitable for a {@code GeneralBed} under standard
     *       policy (requires an authorized clinical override if emergency boarding is needed).</li>
     *   <li>If the patient requires isolation, the bed must be isolation-capable.</li>
     *   <li>The bed's ward specialty must match the patient's required ward type.</li>
     * </ul>
     */
    @Override
    public boolean isSuitableFor(Patient patient) {
        if (patient == null) {
            return false;
        }
        if (patient.requiresIntensiveCare()) {
            return false;
        }
        if (patient.isNeedsIsolation() && !isIsolationCapable()) {
            return false;
        }
        return this.getWardType() == patient.getRequiredWardType();
    }

    /**
     * Polymorphic suitability scoring for General/Specialty beds:
     * Applies the Blossom Care base compatibility formula (+50 ward match, +25 ventilator match,
     * +20 isolation match). If a patient requires ICU care or mechanical ventilation that this
     * general bed cannot provide, a heavy clinical penalty is applied so ICU beds always rank first.
     */
    @Override
    public int calculateSuitabilityScore(Patient patient) {
        int score = computeBaseCompatibilityScore(patient);
        if (patient.requiresIntensiveCare()) {
            score -= 50;
        }
        if (patient.isNeedsIsolation() && !isIsolationCapable()) {
            score -= 35;
        }
        return Math.max(0, score);
    }

    @Override
    public String getBedCategory() {
        return getWardType().getDisplayName() + " Inpatient Bed";
    }

    public String getWingSection() {
        return wingSection;
    }

    public boolean isStepDownTelemetryCapable() {
        return stepDownTelemetryCapable;
    }
}
