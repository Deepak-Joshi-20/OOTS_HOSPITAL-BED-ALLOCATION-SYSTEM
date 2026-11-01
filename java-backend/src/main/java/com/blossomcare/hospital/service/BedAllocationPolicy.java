package com.blossomcare.hospital.service;

import com.blossomcare.hospital.model.Bed;
import com.blossomcare.hospital.model.Patient;

import java.util.List;
import java.util.Optional;

/**
 * Interface defining the contract for hospital bed suitability evaluation and
 * candidate bed ranking.
 *
 * <p>Demonstrates <b>Abstraction</b>: decouples the {@link AllocationService} from
 * specific clinical scoring algorithms so alternative hospital triage policies can
 * be plugged in without modifying the service orchestration layer.</p>
 */
public interface BedAllocationPolicy {

    /**
     * Evaluates whether the candidate bed satisfies all clinical safety requirements
     * for the patient when {@code staffOverride} is {@code false}, or whether an
     * authorized clinical override permits emergency placement.
     *
     * @param patient       the patient requiring admission
     * @param bed           the candidate bed
     * @param staffOverride {@code true} if an authorized staff member is overriding
     *                      ward/specialty matching rules
     * @return {@code true} if the allocation is clinically permissible
     */
    boolean canAllocate(Patient patient, Bed bed, boolean staffOverride);

    /**
     * Computes a numeric suitability score for pairing the given patient with the candidate bed.
     *
     * @param patient the patient requiring admission
     * @param bed     the candidate bed
     * @return numeric compatibility score
     */
    int evaluateCompatibilityScore(Patient patient, Bed bed);

    /**
     * Ranks all currently available beds in descending order of clinical suitability
     * for the specified patient.
     *
     * @param patient       the patient requiring admission
     * @param candidateBeds all beds in the hospital inventory
     * @return ordered list of available candidate beds
     */
    List<Bed> rankAvailableBedsForPatient(Patient patient, List<Bed> candidateBeds);

    /**
     * Selects the single highest-scoring clinically suitable bed for the patient.
     *
     * @param patient       the patient requiring admission
     * @param candidateBeds all beds in the hospital inventory
     * @param staffOverride whether fallback non-specialty beds may be selected if no exact match exists
     * @return the optimal {@link Bed} wrapped in an {@link Optional}
     */
    Optional<Bed> selectOptimalBed(Patient patient, List<Bed> candidateBeds, boolean staffOverride);
}
