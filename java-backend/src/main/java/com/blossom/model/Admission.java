package com.blossom.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Association entity recording an active or completed inpatient Admission,
 * linking a {@link Patient}, an allocated {@link Bed}, and the hosting {@link Ward}.
 */
public class Admission {

    public enum AdmissionState {
        ACTIVE("Active"),
        DISCHARGED("Discharged"),
        TRANSFERRED("Transferred");

        private final String label;

        AdmissionState(String label) {
            this.label = label;
        }

        public String getLabel() {
            return label;
        }
    }

    private final String admissionId;
    private final Patient patient;
    private final Bed bed;
    private final Ward ward;
    private final String attendingPhysician;
    private final String admittedByStaff;
    private final LocalDateTime admittedAt;
    private final int suitabilityScoreAtAllocation;
    private final boolean allocatedViaOverride;
    private final String allocationRationale;
    private AdmissionState state;
    private LocalDateTime dischargedAt;

    public Admission(
            String admissionId,
            Patient patient,
            Bed bed,
            Ward ward,
            String attendingPhysician,
            String admittedByStaff,
            LocalDateTime admittedAt,
            int suitabilityScoreAtAllocation,
            boolean allocatedViaOverride,
            String allocationRationale
    ) {
        if (admissionId == null || admissionId.isBlank()) {
            throw new IllegalArgumentException("Admission ID cannot be null or blank.");
        }
        if (patient == null) {
            throw new IllegalArgumentException("Patient cannot be null in an Admission record.");
        }
        if (bed == null) {
            throw new IllegalArgumentException("Bed cannot be null in an Admission record.");
        }
        if (ward == null) {
            throw new IllegalArgumentException("Ward cannot be null in an Admission record.");
        }
        this.admissionId = admissionId.trim();
        this.patient = patient;
        this.bed = bed;
        this.ward = ward;
        this.attendingPhysician = (attendingPhysician == null || attendingPhysician.isBlank())
                ? patient.getAttendingDoctor() : attendingPhysician.trim();
        this.admittedByStaff = (admittedByStaff == null || admittedByStaff.isBlank())
                ? "System Triage Engine" : admittedByStaff.trim();
        this.admittedAt = (admittedAt != null) ? admittedAt : LocalDateTime.now();
        this.suitabilityScoreAtAllocation = suitabilityScoreAtAllocation;
        this.allocatedViaOverride = allocatedViaOverride;
        this.allocationRationale = (allocationRationale == null) ? "" : allocationRationale.trim();
        this.state = AdmissionState.ACTIVE;
        this.dischargedAt = null;
    }

    public void markCompletedOnDischarge(LocalDateTime dischargeTime) {
        this.state = AdmissionState.DISCHARGED;
        this.dischargedAt = (dischargeTime != null) ? dischargeTime : LocalDateTime.now();
    }

    public String getAdmissionId() {
        return admissionId;
    }

    public Patient getPatient() {
        return patient;
    }

    public Bed getBed() {
        return bed;
    }

    public Ward getWard() {
        return ward;
    }

    public String getAttendingPhysician() {
        return attendingPhysician;
    }

    public String getAdmittedByStaff() {
        return admittedByStaff;
    }

    public LocalDateTime getAdmittedAt() {
        return admittedAt;
    }

    public int getSuitabilityScoreAtAllocation() {
        return suitabilityScoreAtAllocation;
    }

    public boolean isAllocatedViaOverride() {
        return allocatedViaOverride;
    }

    public String getAllocationRationale() {
        return allocationRationale;
    }

    public AdmissionState getState() {
        return state;
    }

    public LocalDateTime getDischargedAt() {
        return dischargedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Admission admission)) return false;
        return Objects.equals(admissionId, admission.admissionId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(admissionId);
    }

    @Override
    public String toString() {
        return String.format("Admission[%s | Patient=%s (%s) -> Bed=%s (%s) | Score=%d | Override=%s | State=%s]",
                admissionId, patient.getName(), patient.getId(), bed.getBedNumber(),
                ward.getName(), suitabilityScoreAtAllocation, allocatedViaOverride, state.getLabel());
    }
}
