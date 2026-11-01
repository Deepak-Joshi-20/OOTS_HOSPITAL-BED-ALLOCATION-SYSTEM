package com.blossomcare.hospital.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Data Transfer Object (DTO) for requesting bed allocation for a waiting patient.
 */
public class AllocationRequestDto {

    @NotBlank(message = "Patient ID is required")
    private String patientId;

    @NotBlank(message = "Bed ID or Bed Number is required")
    private String bedId;

    private String staffActor = "Admissions Coordinator";
    private boolean staffOverride = false;
    private String overrideReason = "";

    public String getPatientId() {
        return patientId;
    }

    public void setPatientId(String patientId) {
        this.patientId = patientId;
    }

    public String getBedId() {
        return bedId;
    }

    public void setBedId(String bedId) {
        this.bedId = bedId;
    }

    public String getStaffActor() {
        return staffActor;
    }

    public void setStaffActor(String staffActor) {
        this.staffActor = staffActor;
    }

    public boolean isStaffOverride() {
        return staffOverride;
    }

    public void setStaffOverride(boolean staffOverride) {
        this.staffOverride = staffOverride;
    }

    public String getOverrideReason() {
        return overrideReason;
    }

    public void setOverrideReason(String overrideReason) {
        this.overrideReason = overrideReason;
    }
}
