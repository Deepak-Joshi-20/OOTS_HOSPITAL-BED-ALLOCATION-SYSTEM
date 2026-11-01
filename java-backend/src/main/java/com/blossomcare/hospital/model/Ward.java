package com.blossomcare.hospital.model;

import com.blossomcare.hospital.model.enums.BedStatus;
import com.blossomcare.hospital.model.enums.WardType;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Domain entity representing a Hospital Ward in the Blossom Care platform.
 *
 * <p>Demonstrates <b>Aggregation / Composition</b>: A {@code Ward} manages a collection
 * of {@link Bed} instances (which may polymorphically be {@link ICUBed} or {@link GeneralBed})
 * and computes real-time occupancy metrics, available capacity, and sanitation turnover counts.</p>
 */
public class Ward {

    private final String id;
    private String name;
    private final WardType type;
    private final int floor;
    private String wing;
    private String headNurse;
    private String contactExtension;
    private String description;
    private final List<Bed> beds;

    public Ward(
            String id,
            String name,
            WardType type,
            int floor,
            String wing,
            String headNurse,
            String contactExtension,
            String description
    ) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Ward ID cannot be null or blank.");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Ward name cannot be null or blank.");
        }
        if (type == null) {
            throw new IllegalArgumentException("Ward type cannot be null.");
        }
        if (floor < 1 || floor > 50) {
            throw new IllegalArgumentException("Ward floor must be between 1 and 50.");
        }
        this.id = id.trim();
        this.name = name.trim();
        this.type = type;
        this.floor = floor;
        this.wing = (wing == null || wing.isBlank()) ? "North Pavilion" : wing.trim();
        this.headNurse = (headNurse == null || headNurse.isBlank()) ? "Charge Nurse" : headNurse.trim();
        this.contactExtension = (contactExtension == null || contactExtension.isBlank()) ? "Ext. 4000" : contactExtension.trim();
        this.description = (description == null) ? type.getClinicalDescription() : description.trim();
        this.beds = new ArrayList<>();
    }

    /**
     * Adds a bed to this ward, validating that the bed belongs to this ward ID and ward type.
     */
    public void addBed(Bed bed) {
        if (bed == null) {
            throw new IllegalArgumentException("Cannot add a null bed to ward " + name);
        }
        if (!this.id.equals(bed.getWardId())) {
            throw new IllegalArgumentException(String.format(
                    "Bed '%s' belongs to ward ID '%s' and cannot be added to ward '%s' (%s).",
                    bed.getBedNumber(), bed.getWardId(), this.name, this.id));
        }
        boolean duplicate = beds.stream()
                .anyMatch(existing -> existing.getId().equals(bed.getId())
                        || existing.getBedNumber().equalsIgnoreCase(bed.getBedNumber()));
        if (duplicate) {
            throw new IllegalArgumentException("Duplicate bed '" + bed.getBedNumber() + "' in ward " + name);
        }
        beds.add(bed);
    }

    public Optional<Bed> findBedById(String bedId) {
        return beds.stream()
                .filter(b -> b.getId().equalsIgnoreCase(bedId) || b.getBedNumber().equalsIgnoreCase(bedId))
                .findFirst();
    }

    public List<Bed> getBeds() {
        return Collections.unmodifiableList(beds);
    }

    public List<Bed> getAvailableBeds() {
        return beds.stream()
                .filter(Bed::isAvailable)
                .collect(Collectors.toList());
    }

    public int getTotalCapacity() {
        return beds.size();
    }

    public long getOccupiedCount() {
        return beds.stream().filter(b -> b.getStatus() == BedStatus.OCCUPIED).count();
    }

    public long getAvailableCount() {
        return beds.stream().filter(b -> b.getStatus() == BedStatus.AVAILABLE).count();
    }

    public long getCleaningCount() {
        return beds.stream().filter(b -> b.getStatus() == BedStatus.CLEANING).count();
    }

    public long getMaintenanceCount() {
        return beds.stream().filter(b -> b.getStatus() == BedStatus.MAINTENANCE).count();
    }

    /**
     * Computes the real-time ward occupancy percentage (0.0 to 100.0).
     */
    public double getOccupancyPercentage() {
        if (beds.isEmpty()) {
            return 0.0;
        }
        return (getOccupiedCount() * 100.0) / beds.size();
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Ward name cannot be blank.");
        }
        this.name = name.trim();
    }

    public WardType getType() {
        return type;
    }

    public int getFloor() {
        return floor;
    }

    public String getWing() {
        return wing;
    }

    public String getHeadNurse() {
        return headNurse;
    }

    public void setHeadNurse(String headNurse) {
        if (headNurse == null || headNurse.isBlank()) {
            throw new IllegalArgumentException("Head nurse name cannot be blank.");
        }
        this.headNurse = headNurse.trim();
    }

    public String getContactExtension() {
        return contactExtension;
    }

    public String getDescription() {
        return description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Ward ward)) return false;
        return Objects.equals(id, ward.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return String.format("Ward[%s | %s (%s, Floor %d %s) | Occupied=%d/%d (%.1f%%) | Avail=%d | Cleaning=%d | Maint=%d]",
                id, name, type, floor, wing, getOccupiedCount(), getTotalCapacity(),
                getOccupancyPercentage(), getAvailableCount(), getCleaningCount(), getMaintenanceCount());
    }
}
