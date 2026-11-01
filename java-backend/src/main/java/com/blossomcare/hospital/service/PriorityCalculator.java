package com.blossomcare.hospital.service;

import com.blossomcare.hospital.model.AllocationRequest;
import com.blossomcare.hospital.model.Patient;
import com.blossomcare.hospital.model.enums.AcuityLevel;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility and policy class for computing patient triage priority scores and
 * ordering waiting-list patients deterministically.
 */
public final class PriorityCalculator {

    private PriorityCalculator() {
        // Utility class
    }

    /**
     * Returns the base priority score associated with an {@link AcuityLevel}
     * in the Blossom Care platform:
     * Critical = 95, High = 82, Moderate = 60, Stable = 35.
     */
    public static int getBaseScoreForAcuity(AcuityLevel acuity) {
        if (acuity == null) {
            throw new IllegalArgumentException("AcuityLevel cannot be null.");
        }
        return acuity.getBasePriorityScore();
    }

    /**
     * Computes a patient's total clinical priority score [1..100].
     */
    public static int calculatePriorityScore(Patient patient) {
        if (patient == null) {
            throw new IllegalArgumentException("Patient cannot be null.");
        }
        return patient.computeClinicalPriorityScore();
    }

    /**
     * Sorts allocation requests by descending priority score, with deterministic
     * arrival-order (FIFO) tie-breaking.
     */
    public static List<AllocationRequest> sortWaitingQueue(List<AllocationRequest> requests) {
        if (requests == null) {
            return List.of();
        }
        return requests.stream()
                .sorted(Comparator.naturalOrder())
                .collect(Collectors.toList());
    }
}
