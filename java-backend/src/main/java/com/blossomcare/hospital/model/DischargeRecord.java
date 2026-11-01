package com.blossomcare.hospital.model;

import com.blossomcare.hospital.model.enums.BedStatus;
import com.blossomcare.hospital.model.enums.DischargeOutcome;

import java.time.LocalDateTime;

/**
 * Immutable clinical record generated when an inpatient is discharged and their bed is released.
 * Mirrors {@code DischargeRecord} in the Blossom Care TypeScript domain model.
 */
public final class DischargeRecord {

    private final String id;
    private final String patientId;
    private final String patientName;
    private final String releasedBedId;
    private final String releasedBedNumber;
    private final String wardName;
    private final String dischargedBy;
    private final LocalDateTime dischargedAt;
    private final DischargeOutcome outcome;
    private final BedStatus postDischargeBedStatus;
    private final String summaryNotes;

    public DischargeRecord(
            String id,
            String patientId,
            String patientName,
            String releasedBedId,
            String releasedBedNumber,
            String wardName,
            String dischargedBy,
            LocalDateTime dischargedAt,
            DischargeOutcome outcome,
            BedStatus postDischargeBedStatus,
            String summaryNotes
    ) {
        this.id = id;
        this.patientId = patientId;
        this.patientName = patientName;
        this.releasedBedId = releasedBedId;
        this.releasedBedNumber = releasedBedNumber;
        this.wardName = wardName;
        this.dischargedBy = dischargedBy;
        this.dischargedAt = dischargedAt != null ? dischargedAt : LocalDateTime.now();
        this.outcome = outcome != null ? outcome : DischargeOutcome.RECOVERED_HOME;
        this.postDischargeBedStatus = postDischargeBedStatus != null ? postDischargeBedStatus : BedStatus.CLEANING;
        this.summaryNotes = summaryNotes != null ? summaryNotes : "";
    }

    public String getId() {
        return id;
    }

    public String getPatientId() {
        return patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public String getReleasedBedId() {
        return releasedBedId;
    }

    public String getReleasedBedNumber() {
        return releasedBedNumber;
    }

    public String getWardName() {
        return wardName;
    }

    public String getDischargedBy() {
        return dischargedBy;
    }

    public LocalDateTime getDischargedAt() {
        return dischargedAt;
    }

    public DischargeOutcome getOutcome() {
        return outcome;
    }

    public BedStatus getPostDischargeBedStatus() {
        return postDischargeBedStatus;
    }

    public String getSummaryNotes() {
        return summaryNotes;
    }

    @Override
    public String toString() {
        return String.format("DischargeRecord[%s | Patient=%s (%s) | ReleasedBed=%s (%s) | Outcome=%s | BedState=%s]",
                id, patientName, patientId, releasedBedNumber, wardName,
                outcome.getDisplayName(), postDischargeBedStatus.getDisplayName());
    }
}
