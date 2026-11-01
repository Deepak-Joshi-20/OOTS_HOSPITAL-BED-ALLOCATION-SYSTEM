package com.blossomcare.hospital.service;

import com.blossomcare.hospital.model.Ward;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

/**
 * Encapsulated reporting snapshot summarizing real-time hospital bed capacity,
 * ward-by-ward occupancy rates, ICU ventilator utilization, and waiting queue metrics.
 */
public final class OccupancyReport {

    public static final class WardSummary {
        private final String wardId;
        private final String wardName;
        private final String wardType;
        private final int totalBeds;
        private final long occupiedBeds;
        private final long availableBeds;
        private final long cleaningBeds;
        private final long maintenanceBeds;
        private final double occupancyPercentage;

        public WardSummary(Ward ward) {
            this.wardId = ward.getId();
            this.wardName = ward.getName();
            this.wardType = ward.getType().getDisplayName();
            this.totalBeds = ward.getTotalCapacity();
            this.occupiedBeds = ward.getOccupiedCount();
            this.availableBeds = ward.getAvailableCount();
            this.cleaningBeds = ward.getCleaningCount();
            this.maintenanceBeds = ward.getMaintenanceCount();
            this.occupancyPercentage = ward.getOccupancyPercentage();
        }

        public String getWardId() {
            return wardId;
        }

        public String getWardName() {
            return wardName;
        }

        public String getWardType() {
            return wardType;
        }

        public int getTotalBeds() {
            return totalBeds;
        }

        public long getOccupiedBeds() {
            return occupiedBeds;
        }

        public long getAvailableBeds() {
            return availableBeds;
        }

        public long getCleaningBeds() {
            return cleaningBeds;
        }

        public long getMaintenanceBeds() {
            return maintenanceBeds;
        }

        public double getOccupancyPercentage() {
            return occupancyPercentage;
        }

        @Override
        public String toString() {
            return String.format("%-28s | %-10s | Total: %2d | Occ: %2d | Avail: %2d | Clean: %2d | Maint: %2d | Load: %5.1f%%",
                    wardName, wardType, totalBeds, occupiedBeds, availableBeds,
                    cleaningBeds, maintenanceBeds, occupancyPercentage);
        }
    }

    private final LocalDateTime generatedAt;
    private final int totalBeds;
    private final int occupiedBeds;
    private final int availableBeds;
    private final int cleaningBeds;
    private final int maintenanceBeds;
    private final double overallOccupancyPercentage;
    private final int totalIcuBeds;
    private final int availableIcuBeds;
    private final int waitingQueueSize;
    private final int criticalWaitingCount;
    private final int activeAdmissionsCount;
    private final int completedDischargesCount;
    private final List<WardSummary> wardSummaries;

    public OccupancyReport(
            LocalDateTime generatedAt,
            int totalBeds,
            int occupiedBeds,
            int availableBeds,
            int cleaningBeds,
            int maintenanceBeds,
            int totalIcuBeds,
            int availableIcuBeds,
            int waitingQueueSize,
            int criticalWaitingCount,
            int activeAdmissionsCount,
            int completedDischargesCount,
            List<WardSummary> wardSummaries
    ) {
        this.generatedAt = generatedAt != null ? generatedAt : LocalDateTime.now();
        this.totalBeds = totalBeds;
        this.occupiedBeds = occupiedBeds;
        this.availableBeds = availableBeds;
        this.cleaningBeds = cleaningBeds;
        this.maintenanceBeds = maintenanceBeds;
        this.overallOccupancyPercentage = totalBeds > 0 ? (occupiedBeds * 100.0) / totalBeds : 0.0;
        this.totalIcuBeds = totalIcuBeds;
        this.availableIcuBeds = availableIcuBeds;
        this.waitingQueueSize = waitingQueueSize;
        this.criticalWaitingCount = criticalWaitingCount;
        this.activeAdmissionsCount = activeAdmissionsCount;
        this.completedDischargesCount = completedDischargesCount;
        this.wardSummaries = wardSummaries != null ? Collections.unmodifiableList(wardSummaries) : List.of();
    }

    public LocalDateTime getGeneratedAt() {
        return generatedAt;
    }

    public int getTotalBeds() {
        return totalBeds;
    }

    public int getOccupiedBeds() {
        return occupiedBeds;
    }

    public int getAvailableBeds() {
        return availableBeds;
    }

    public int getCleaningBeds() {
        return cleaningBeds;
    }

    public int getMaintenanceBeds() {
        return maintenanceBeds;
    }

    public double getOverallOccupancyPercentage() {
        return overallOccupancyPercentage;
    }

    public int getTotalIcuBeds() {
        return totalIcuBeds;
    }

    public int getAvailableIcuBeds() {
        return availableIcuBeds;
    }

    public int getWaitingQueueSize() {
        return waitingQueueSize;
    }

    public int getCriticalWaitingCount() {
        return criticalWaitingCount;
    }

    public int getActiveAdmissionsCount() {
        return activeAdmissionsCount;
    }

    public int getCompletedDischargesCount() {
        return completedDischargesCount;
    }

    public List<WardSummary> getWardSummaries() {
        return wardSummaries;
    }

    public String toFormattedReportString() {
        StringBuilder sb = new StringBuilder();
        sb.append("========================================================================================================\n");
        sb.append("                     BLOSSOM CARE — HOSPITAL BED OCCUPANCY & CLINICAL TELEMETRY REPORT                  \n");
        sb.append("========================================================================================================\n");
        sb.append(String.format("Total Capacity : %d Beds  | Occupied : %d (%.1f%%) | Available : %d | Cleaning : %d | Maintenance : %d%n",
                totalBeds, occupiedBeds, overallOccupancyPercentage, availableBeds, cleaningBeds, maintenanceBeds));
        sb.append(String.format("ICU Capacity   : %d Beds  | Available ICU : %d     | Waiting Queue : %d (%d Critical) | Discharges : %d%n",
                totalIcuBeds, availableIcuBeds, waitingQueueSize, criticalWaitingCount, completedDischargesCount));
        sb.append("--------------------------------------------------------------------------------------------------------\n");
        for (WardSummary ws : wardSummaries) {
            sb.append(ws.toString()).append("\n");
        }
        sb.append("========================================================================================================");
        return sb.toString();
    }
}
