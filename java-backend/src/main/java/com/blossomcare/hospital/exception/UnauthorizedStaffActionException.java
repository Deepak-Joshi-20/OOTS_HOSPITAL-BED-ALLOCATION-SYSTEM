package com.blossomcare.hospital.exception;

import com.blossomcare.hospital.model.enums.StaffRole;

/**
 * Thrown when a staff member attempts an operation that exceeds their role's
 * RBAC permission set.
 */
public class UnauthorizedStaffActionException extends RuntimeException {

    private final StaffRole staffRole;
    private final StaffRole.Permission requiredPermission;

    public UnauthorizedStaffActionException(StaffRole staffRole, StaffRole.Permission requiredPermission) {
        super(String.format("Role '%s' lacks required permission '%s' to perform this clinical operation.",
                staffRole != null ? staffRole.getDisplayName() : "UNAUTHENTICATED",
                requiredPermission));
        this.staffRole = staffRole;
        this.requiredPermission = requiredPermission;
    }

    public StaffRole getStaffRole() {
        return staffRole;
    }

    public StaffRole.Permission getRequiredPermission() {
        return requiredPermission;
    }
}
