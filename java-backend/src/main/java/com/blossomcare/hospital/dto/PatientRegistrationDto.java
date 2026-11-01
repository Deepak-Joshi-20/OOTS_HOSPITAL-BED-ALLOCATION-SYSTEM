package com.blossomcare.hospital.dto;

import com.blossomcare.hospital.model.enums.AcuityLevel;
import com.blossomcare.hospital.model.enums.WardType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Data Transfer Object (DTO) for registering a new patient and admission request
 * via the Blossom Care REST API.
 */
public class PatientRegistrationDto {

    @NotBlank(message = "Patient name is required")
    private String name;

    @Min(value = 0, message = "Age must be >= 0")
    @Max(value = 130, message = "Age must be <= 130")
    private int age;

    @NotBlank(message = "Gender is required")
    private String gender;

    private String bloodGroup = "O+";

    @NotBlank(message = "Diagnosis is required")
    private String diagnosis;

    @NotNull(message = "Clinical acuity level is required")
    private AcuityLevel acuity;

    @NotNull(message = "Required ward specialty is required")
    private WardType requiredWardType;

    private boolean needsVentilator;
    private boolean needsIsolation;
    private String attendingDoctor = "Dr. Julian Sterling";
    private String emergencyContact = "+1 (555) 019-2831";

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public int getAge() {
        return age;
    }

    public void setAge(int age) {
        this.age = age;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getBloodGroup() {
        return bloodGroup;
    }

    public void setBloodGroup(String bloodGroup) {
        this.bloodGroup = bloodGroup;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public AcuityLevel getAcuity() {
        return acuity;
    }

    public void setAcuity(AcuityLevel acuity) {
        this.acuity = acuity;
    }

    public WardType getRequiredWardType() {
        return requiredWardType;
    }

    public void setRequiredWardType(WardType requiredWardType) {
        this.requiredWardType = requiredWardType;
    }

    public boolean isNeedsVentilator() {
        return needsVentilator;
    }

    public void setNeedsVentilator(boolean needsVentilator) {
        this.needsVentilator = needsVentilator;
    }

    public boolean isNeedsIsolation() {
        return needsIsolation;
    }

    public void setNeedsIsolation(boolean needsIsolation) {
        this.needsIsolation = needsIsolation;
    }

    public String getAttendingDoctor() {
        return attendingDoctor;
    }

    public void setAttendingDoctor(String attendingDoctor) {
        this.attendingDoctor = attendingDoctor;
    }

    public String getEmergencyContact() {
        return emergencyContact;
    }

    public void setEmergencyContact(String emergencyContact) {
        this.emergencyContact = emergencyContact;
    }
}
