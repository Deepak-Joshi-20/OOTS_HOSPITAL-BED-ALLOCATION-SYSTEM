package com.blossomcare.hospital.service;

import com.blossomcare.hospital.model.Bed;
import com.blossomcare.hospital.model.Patient;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Standard Blossom Care implementation of {@link BedAllocationPolicy}.
 *
 * <p>Reproduces the exact suitability rules from the Blossom Care frontend
 * ({@code getRecommendedBedsForPatient} in {@code HospitalContext.tsx}) while
 * leveraging polymorphic dispatch on {@link Bed#isSuitableFor(Patient)} and
 * {@link Bed#calculateSuitabilityScore(Patient)}:</p>
 * <ul>
 *   <li>+50 points when {@code bed.getWardType() == patient.getRequiredWardType()}</li>
 *   <li>+25 points when {@code patient.isNeedsVentilator() && bed.isHasVentilator()}</li>
 *   <li>+20 points when {@code patient.isNeedsIsolation() && bed.isIsolationCapable()}</li>
 *   <li>Enforces ICU placement for critical / ventilator-dependent patients unless
 *       an explicit {@code staffOverride} is provided.</li>
 * </ul>
 */
public class ClinicalBedAllocationPolicy implements BedAllocationPolicy {

    @Override
    public boolean canAllocate(Patient patient, Bed bed, boolean staffOverride) {
        if (patient == null || bed == null) {
            return false;
        }
        if (!bed.isAvailable()) {
            return false;
        }
        if (staffOverride) {
            // Staff override allows cross-specialty placement (e.g., overflow boarding)
            // on any available bed when authorized by clinical leadership.
            return true;
        }
        // Standard policy delegates to the polymorphic Bed.isSuitableFor(Patient) method.
        return bed.isSuitableFor(patient);
    }

    @Override
    public int evaluateCompatibilityScore(Patient patient, Bed bed) {
        if (patient == null || bed == null) {
            throw new IllegalArgumentException("Patient and Bed must not be null when scoring compatibility.");
        }
        // Polymorphic call: executes ICUBed.calculateSuitabilityScore or GeneralBed.calculateSuitabilityScore
        return bed.calculateSuitabilityScore(patient);
    }

    @Override
    public List<Bed> rankAvailableBedsForPatient(Patient patient, List<Bed> candidateBeds) {
        if (patient == null || candidateBeds == null) {
            return List.of();
        }
        return candidateBeds.stream()
                .filter(Bed::isAvailable)
                .sorted(Comparator
                        .comparingInt((Bed bed) -> evaluateCompatibilityScore(patient, bed))
                        .reversed()
                        .thenComparing(Bed::getBedNumber))
                .collect(Collectors.toList());
    }

    @Override
    public Optional<Bed> selectOptimalBed(Patient patient, List<Bed> candidateBeds, boolean staffOverride) {
        if (patient == null || candidateBeds == null) {
            return Optional.empty();
        }
        return candidateBeds.stream()
                .filter(Bed::isAvailable)
                .filter(bed -> canAllocate(patient, bed, staffOverride))
                .max(Comparator
                        .comparingInt((Bed bed) -> evaluateCompatibilityScore(patient, bed))
                        .thenComparing(Comparator.comparing(Bed::getBedNumber).reversed()));
    }
}
