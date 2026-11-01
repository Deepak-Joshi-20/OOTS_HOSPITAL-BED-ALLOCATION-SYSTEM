package com.blossomcare.hospital.dto;

import com.blossomcare.hospital.model.enums.DischargeOutcome;
import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object (DTO) for discharging an admitted patient and releasing their bed.
 */
public class DischargeRequestDto {

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    private DischargeOutcome outcome = DischargeOutcome.RECOVERED_HOME;
    private String dischargedBy = "Attending Physician";
    private String summaryNotes = "Patient stabilized and cleared for discharge.";

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public DischargeOutcome getOutcome() {
        return outcome;
    }

    public void setOutcome(DischargeOutcome outcome) {
        this.outcome = outcome;
    }

    public String getDischargedBy() {
        return dischargedBy;
    }

    public void setDischargedBy(String dischargedBy) {
        this.dischargedBy = dischargedBy;
    }

    public String getSummaryNotes() {
        return summaryNotes;
    }

    public void setSummaryNotes(String summaryNotes) {
        this.summaryNotes = summaryNotes;
    }
}
