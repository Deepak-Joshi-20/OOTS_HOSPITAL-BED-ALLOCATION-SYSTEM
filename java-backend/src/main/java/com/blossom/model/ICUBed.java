package com.blossom.model;

import java.util.List;

/**
 * Concrete subclass of {@link Bed} representing a high-acuity Intensive Care Unit (ICU) bed.
 *
 * <p>Demonstrates <b>Inheritance</b>, <b>Encapsulation</b>, and <b>Polymorphism</b>: extends
 * {@link Bed} with ICU-specific life-support capabilities (ventilator support, invasive
 * hemodynamic monitoring, high-pressure oxygen lines, 1:1 nursing ratio) and overrides
 * suitability evaluation and scoring.</p>
 */
public class ICUBed extends Bed {

    private final boolean invasiveHemodynamicMonitoring;
    private final int oxygenLinePsi;
    private final String nursingRatio;

    /**
     * Concise constructor initializing {@code id}, {@code wardId}, ventilator, and isolation capabilities.
     */
    public ICUBed(String id, String wardId, boolean hasVentilator, boolean isolationCapable) {
        super(id, wardId, WardType.ICU, false, hasVentilator, isolationCapable);
        this.invasiveHemodynamicMonitoring = true;
        this.oxygenLinePsi = 55;
        this.nursingRatio = "1:1 Critical Care Nursing";
    }

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
