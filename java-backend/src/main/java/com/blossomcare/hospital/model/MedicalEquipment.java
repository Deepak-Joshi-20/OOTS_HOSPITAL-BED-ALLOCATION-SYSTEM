package com.blossomcare.hospital.model;

import java.time.LocalDate;
import java.util.Objects;

/**
 * Encapsulated domain entity representing a Hospital Medical Equipment asset
 * (e.g., ICU mechanical ventilator, multiparameter bedside monitor, defibrillator,
 * portable X-ray) in the Blossom Care platform.
 */
public class MedicalEquipment {

    public enum AvailabilityStatus {
        AVAILABLE,
        IN_USE,
        UNDER_MAINTENANCE
    }

    public enum EquipmentCondition {
        EXCELLENT,
        GOOD,
        NEEDS_CALIBRATION
    }

    private final String id;
    private final String assetTag;
    private String name;
    private String category;
    private String assignedWardId;
    private String assignedWardName;
    private AvailabilityStatus availability;
    private EquipmentCondition condition;
    private LocalDate lastServicedDate;
    private LocalDate nextCalibrationDate;
    private final String serialNumber;

    public MedicalEquipment(
            String id,
            String assetTag,
            String name,
            String category,
            String assignedWardId,
            String assignedWardName,
            AvailabilityStatus availability,
            EquipmentCondition condition,
            LocalDate lastServicedDate,
            LocalDate nextCalibrationDate,
            String serialNumber
    ) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Equipment ID cannot be null or blank.");
        }
        if (assetTag == null || assetTag.isBlank()) {
            throw new IllegalArgumentException("Equipment assetTag cannot be null or blank.");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Equipment name cannot be null or blank.");
        }
        this.id = id.trim();
        this.assetTag = assetTag.trim();
        this.name = name.trim();
        this.category = (category == null || category.isBlank()) ? "Life Support" : category.trim();
        this.assignedWardId = (assignedWardId == null || assignedWardId.isBlank()) ? "WARD-ICU" : assignedWardId.trim();
        this.assignedWardName = (assignedWardName == null || assignedWardName.isBlank()) ? "Intensive Care Unit (ICU)" : assignedWardName.trim();
        this.availability = (availability != null) ? availability : AvailabilityStatus.AVAILABLE;
        this.condition = (condition != null) ? condition : EquipmentCondition.EXCELLENT;
        this.lastServicedDate = (lastServicedDate != null) ? lastServicedDate : LocalDate.now().minusMonths(2);
        this.nextCalibrationDate = (nextCalibrationDate != null) ? nextCalibrationDate : LocalDate.now().plusMonths(4);
        this.serialNumber = (serialNumber == null || serialNumber.isBlank()) ? "SN-BLC-001" : serialNumber.trim();
    }

    public void markInUse(String wardId, String wardName) {
        if (this.availability == AvailabilityStatus.UNDER_MAINTENANCE) {
            throw new IllegalStateException("Cannot deploy equipment '" + assetTag + "' while under maintenance.");
        }
        this.availability = AvailabilityStatus.IN_USE;
        if (wardId != null && !wardId.isBlank()) {
            this.assignedWardId = wardId.trim();
        }
        if (wardName != null && !wardName.isBlank()) {
            this.assignedWardName = wardName.trim();
        }
    }

    public void flagForMaintenance() {
        this.availability = AvailabilityStatus.UNDER_MAINTENANCE;
        this.condition = EquipmentCondition.NEEDS_CALIBRATION;
    }

    public void completeMaintenanceAndCalibration(LocalDate serviceDate, LocalDate nextCalDate) {
        this.availability = AvailabilityStatus.AVAILABLE;
        this.condition = EquipmentCondition.EXCELLENT;
        this.lastServicedDate = (serviceDate != null) ? serviceDate : LocalDate.now();
        this.nextCalibrationDate = (nextCalDate != null) ? nextCalDate : this.lastServicedDate.plusMonths(6);
    }

    public boolean requiresServiceAlert() {
        return availability == AvailabilityStatus.UNDER_MAINTENANCE
                || condition == EquipmentCondition.NEEDS_CALIBRATION;
    }

    public String getId() {
        return id;
    }

    public String getAssetTag() {
        return assetTag;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Equipment name cannot be blank.");
        }
        this.name = name.trim();
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        if (category == null || category.isBlank()) {
            throw new IllegalArgumentException("Equipment category cannot be blank.");
        }
        this.category = category.trim();
    }

    public String getAssignedWardId() {
        return assignedWardId;
    }

    public String getAssignedWardName() {
        return assignedWardName;
    }

    public AvailabilityStatus getAvailability() {
        return availability;
    }

    public void setAvailability(AvailabilityStatus availability) {
        if (availability == null) {
            throw new IllegalArgumentException("Availability status cannot be null.");
        }
        this.availability = availability;
    }

    public EquipmentCondition getCondition() {
        return condition;
    }

    public void setCondition(EquipmentCondition condition) {
        if (condition == null) {
            throw new IllegalArgumentException("Equipment condition cannot be null.");
        }
        this.condition = condition;
    }

    public LocalDate getLastServicedDate() {
        return lastServicedDate;
    }

    public LocalDate getNextCalibrationDate() {
        return nextCalibrationDate;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof MedicalEquipment that)) return false;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
