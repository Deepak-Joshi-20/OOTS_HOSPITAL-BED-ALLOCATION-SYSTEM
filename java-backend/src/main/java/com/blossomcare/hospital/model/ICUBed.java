package com.blossomcare.hospital.model;

import com.blossomcare.hospital.model.enums.AcuityLevel;
import com.blossomcare.hospital.model.enums.BedStatus;
import com.blossomcare.hospital.model.enums.WardType;

import java.util.List;

/**
 * Concrete subclass of {@link Bed} representing a high-acuity Intensive Care Unit (ICU) bed.
 *
 * <p>Demonstrates <b>Inheritance</b> and <b>Polymorphism</b>: extends {@link Bed} with
 * ICU-specific life-support capabilities (invasive hemodynamic monitoring, high-pressure
 * oxygen lines, 1:1 nursing ratio) and overrides suitability evaluation and scoring.</p>
 */
public class ICUBed extends Bed {

    private final boolean invasiveHemodynamicMonitoring;
    private final int oxygenLinePsi;
    private final String nursingRatio;

    public ICUBed(
            String id,
            String bedNumber,
            String wardId,
            String wardName,
            int floor,
            BedStatus status,
            boolean hasVentilator,
            boolean isolationCapable,
            double dailyRateUsd,
            List<String> equipment,
            boolean invasiveHemodynamicMonitoring,
            int oxygenLinePsi
    ) {
        super(
                id,
                bedNumber,
                wardId,
                wardName,
                WardType.ICU,
                floor,
                status,
                hasVentilator,
                true, // All ICU beds include continuous multi-lead telemetry
                isolationCapable,
                dailyRateUsd,
                equipment
        );
        if (oxygenLinePsi <= 0) {
            throw new IllegalArgumentException("ICU oxygen line PSI must be positive.");
        }
        this.invasiveHemodynamicMonitoring = invasiveHemodynamicMonitoring;
        this.oxygenLinePsi = oxygenLinePsi;
        this.nursingRatio = "1:1 Critical Care Nursing";
    }

    /**
     * Convenience constructor with standard Blossom Care ICU configuration
     * ($3,200/day, invasive hemodynamic monitoring enabled, 55 PSI oxygen line).
     */
    public ICUBed(
            String id,
            String bedNumber,
            String wardId,
            String wardName,
            int floor,
            BedStatus status,
            boolean hasVentilator,
            boolean isolationCapable
    ) {
        this(
                id,
                bedNumber,
                wardId,
                wardName,
                floor,
                status,
                hasVentilator,
                isolationCapable,
                3200.0,
                List.of("Draeger Evita V800 Ventilator", "Philips IntelliVue MX800", "Alaris Infusion Array", "55 PSI O2 Line"),
                true,
                55
        );
    }

    /**
     * Polymorphic suitability check for ICU beds:
     * <ul>
     *   <li>If the patient requires a mechanical ventilator, this ICU bed MUST have a ventilator.</li>
     *   <li>If the patient requires negative-pressure isolation, this ICU bed MUST be isolation-capable.</li>
     *   <li>ICU beds are primarily reserved for {@code CRITICAL} or {@code HIGH} acuity patients,
     *       patients explicitly requesting {@code WardType.ICU}, or ventilator-dependent patients.</li>
     * </ul>
     */
    @Override
    public boolean isSuitableFor(Patient patient) {
        if (patient == null) {
            return false;
        }
        if (patient.isNeedsVentilator() && !isHasVentilator()) {
            return false;
        }
        if (patient.isNeedsIsolation() && !isIsolationCapable()) {
            return false;
        }
        return patient.requiresIntensiveCare() || patient.getAcuity() == AcuityLevel.HIGH;
    }

    /**
     * Polymorphic suitability scoring for ICU beds:
     * Starts with the Blossom Care base score (+50 ward match, +25 ventilator match, +20 isolation match)
     * and adds an ICU life-support readiness bonus (+5) for CRITICAL patients when invasive
     * hemodynamic monitoring is active. Penalizes non-critical/stable placement in ICU (-30)
     * to preserve critical care capacity.
     */
    @Override
    public int calculateSuitabilityScore(Patient patient) {
        int score = computeBaseCompatibilityScore(patient);
        if (patient.getAcuity() == AcuityLevel.CRITICAL && invasiveHemodynamicMonitoring) {
            score += 5;
        }
        if (patient.isNeedsVentilator() && !isHasVentilator()) {
            score -= 60;
        }
        if (patient.isNeedsIsolation() && !isIsolationCapable()) {
            score -= 40;
        }
        if (patient.getAcuity() == AcuityLevel.STABLE && !patient.requiresIntensiveCare()) {
            score -= 30;
        }
        return Math.max(0, score);
    }

    @Override
    public String getBedCategory() {
        return "Intensive Care Unit (ICU) Bed";
    }

    public boolean isInvasiveHemodynamicMonitoring() {
        return invasiveHemodynamicMonitoring;
    }

    public int getOxygenLinePsi() {
        return oxygenLinePsi;
    }

    public String getNursingRatio() {
        return nursingRatio;
    }
}
