package com.blossom.model;

import java.util.List;

/**
 * Concrete subclass of {@link Bed} representing a non-ICU specialty or general ward bed
 * (e.g., General Medicine, Cardiac Telemetry, Surgical Recovery, Pediatrics, or Maternity).
 *
 * <p>Demonstrates <b>Inheritance</b>, <b>Encapsulation</b>, and <b>Polymorphism</b>: overrides
 * {@link #isSuitableFor(Patient)} and {@link #calculateSuitabilityScore(Patient)} to
 * enforce clinical safety rules—specifically preventing critical or ventilator-dependent
 * patients from being placed in a general ward bed without an explicit staff override.</p>
 */
public class GeneralBed extends Bed {

    private final String wingSection;
    private final boolean stepDownTelemetryCapable;
    private final boolean oxygenSupplyAvailable;

    /**
     * Concise constructor initializing {@code id}, {@code wardId}, and default general bed state.
     */
    public GeneralBed(String id, String wardId, boolean oxygenSupplyAvailable) {
        super(id, wardId, WardType.GENERAL, false, false, false);
        this.wingSection = "East Pavilion";
        this.stepDownTelemetryCapable = false;
        this.oxygenSupplyAvailable = oxygenSupplyAvailable;
    }

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
        this.oxygenSupplyAvailable = true;
    }

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

    public boolean isOxygenSupplyAvailable() {
        return oxygenSupplyAvailable;
    }
}
