package com.blossom.model;

import java.time.LocalDateTime;
import java.util.Objects;

/**
 * Represents a queued or active clinical bed allocation request for a {@link Patient}.
 *
 * <p>Implements {@link Comparable} so requests in the hospital waiting queue are
 * deterministically ordered by descending priority score and FIFO arrival order for ties.</p>
 */
public class AllocationRequest implements Comparable<AllocationRequest> {

    private final String requestId;
    private final Patient patient;
    private final LocalDateTime requestedAt;
    private final long arrivalSequence;
    private final boolean staffOverride;
    private final String overrideReason;
    private final String requestedByStaff;

    public AllocationRequest(
            String requestId,
            Patient patient,
            LocalDateTime requestedAt,
            long arrivalSequence,
            boolean staffOverride,
            String overrideReason,
            String requestedByStaff
    ) {
        if (requestId == null || requestId.isBlank()) {
            throw new IllegalArgumentException("Allocation request ID cannot be null or blank.");
        }
        if (patient == null) {
            throw new IllegalArgumentException("Patient cannot be null in an AllocationRequest.");
        }
        if (staffOverride && (overrideReason == null || overrideReason.isBlank())) {
            throw new IllegalArgumentException("A clinical override reason is required when staffOverride is true.");
        }
        this.requestId = requestId.trim();
        this.patient = patient;
        this.requestedAt = (requestedAt != null) ? requestedAt : LocalDateTime.now();
        this.arrivalSequence = arrivalSequence;
        this.staffOverride = staffOverride;
        this.overrideReason = (overrideReason == null) ? "" : overrideReason.trim();
        this.requestedByStaff = (requestedByStaff == null || requestedByStaff.isBlank())
                ? "Admissions Desk" : requestedByStaff.trim();
    }

    public String getRequestId() {
        return requestId;
    }

    public Patient getPatient() {
        return patient;
    }

    public int getPriorityScore() {
        return patient.getPriorityScore();
    }

    public LocalDateTime getRequestedAt() {
        return requestedAt;
    }

    public long getArrivalSequence() {
        return arrivalSequence;
    }

    public boolean isStaffOverride() {
        return staffOverride;
    }

    public String getOverrideReason() {
        return overrideReason;
    }

    public String getRequestedByStaff() {
        return requestedByStaff;
    }

    @Override
    public int compareTo(AllocationRequest other) {
        int scoreComparison = Integer.compare(other.getPriorityScore(), this.getPriorityScore());
        if (scoreComparison != 0) {
            return scoreComparison;
        }
        int timeComparison = this.requestedAt.compareTo(other.requestedAt);
        if (timeComparison != 0) {
            return timeComparison;
        }
        return Long.compare(this.arrivalSequence, other.arrivalSequence);
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof AllocationRequest that)) return false;
        return Objects.equals(requestId, that.requestId);
    }

    @Override
    public int hashCode() {
        return Objects.hash(requestId);
    }

    @Override
    public String toString() {
        return String.format("AllocationRequest[%s | Patient=%s (%s) | Priority=%d | RequestedAt=%s | Seq=%d | Override=%s]",
                requestId, patient.getName(), patient.getId(), getPriorityScore(),
                requestedAt, arrivalSequence, staffOverride);
    }
}
