package com.blossomcare.hospital.model.enums;

import java.util.EnumSet;
import java.util.Set;

/**
 * Represents role-based access control (RBAC) roles for hospital personnel
 * in the Blossom Care platform.
 */
public enum StaffRole {
    ADMINISTRATOR(
            "Administrator",
            EnumSet.of(
                    Permission.MANAGE_STAFF,
                    Permission.MANAGE_WARDS,
                    Permission.MANAGE_SETTINGS,
                    Permission.VIEW_AUDIT_LOGS,
                    Permission.MANAGE_PATIENTS,
                    Permission.CREATE_ADMISSIONS,
                    Permission.ALLOCATE_BEDS,
                    Permission.OVERRIDE_ALLOCATION_POLICY,
                    Permission.MANAGE_DISCHARGES,
                    Permission.UPDATE_BED_STATUS,
                    Permission.VIEW_ANALYTICS
            )
    ),
    ADMISSION_STAFF(
            "Admission Staff",
            EnumSet.of(
                    Permission.MANAGE_PATIENTS,
                    Permission.CREATE_ADMISSIONS,
                    Permission.ALLOCATE_BEDS,
                    Permission.OVERRIDE_ALLOCATION_POLICY,
                    Permission.UPDATE_BED_STATUS,
                    Permission.VIEW_ANALYTICS
            )
    ),
    WARD_STAFF(
            "Ward Staff",
            EnumSet.of(
                    Permission.MANAGE_PATIENTS,
                    Permission.ALLOCATE_BEDS,
                    Permission.MANAGE_DISCHARGES,
                    Permission.UPDATE_BED_STATUS,
                    Permission.VIEW_ANALYTICS
            )
    );

    public enum Permission {
        MANAGE_STAFF,
        MANAGE_WARDS,
        MANAGE_SETTINGS,
        VIEW_AUDIT_LOGS,
        MANAGE_PATIENTS,
        CREATE_ADMISSIONS,
        ALLOCATE_BEDS,
        OVERRIDE_ALLOCATION_POLICY,
        MANAGE_DISCHARGES,
        UPDATE_BED_STATUS,
        VIEW_ANALYTICS
    }

    private final String displayName;
    private final Set<Permission> permissions;

    StaffRole(String displayName, Set<Permission> permissions) {
        this.displayName = displayName;
        this.permissions = EnumSet.copyOf(permissions);
    }

    public String getDisplayName() {
        return displayName;
    }

    public Set<Permission> getPermissions() {
        return EnumSet.copyOf(permissions);
    }

    public boolean hasPermission(Permission permission) {
        return permissions.contains(permission);
    }

    @Override
    public String toString() {
        return displayName;
    }
}
