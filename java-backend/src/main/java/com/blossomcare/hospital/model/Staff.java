package com.blossomcare.hospital.model;

import com.blossomcare.hospital.model.enums.StaffRole;

import java.util.Objects;

/**
 * Encapsulated domain entity representing a Hospital Staff member with
 * Role-Based Access Control (RBAC) privileges in the Blossom Care platform.
 */
public class Staff {

    private final String id;
    private String name;
    private String email;
    private StaffRole role;
    private String department;
    private String title;
    private boolean active;

    public Staff(
            String id,
            String name,
            String email,
            StaffRole role,
            String department,
            String title,
            boolean active
    ) {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Staff ID cannot be null or blank.");
        }
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Staff name cannot be null or blank.");
        }
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Staff email cannot be null or blank.");
        }
        if (role == null) {
            throw new IllegalArgumentException("Staff role cannot be null.");
        }
        this.id = id.trim();
        this.name = name.trim();
        this.email = email.trim();
        this.role = role;
        this.department = (department == null || department.isBlank()) ? "Clinical Operations" : department.trim();
        this.title = (title == null || title.isBlank()) ? role.getDisplayName() : title.trim();
        this.active = active;
    }

    public boolean canPerform(StaffRole.Permission permission) {
        return active && role.hasPermission(permission);
    }

    public String getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        if (name == null || name.isBlank()) {
            throw new IllegalArgumentException("Staff name cannot be blank.");
        }
        this.name = name.trim();
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Staff email cannot be blank.");
        }
        this.email = email.trim();
    }

    public StaffRole getRole() {
        return role;
    }

    public void setRole(StaffRole role) {
        if (role == null) {
            throw new IllegalArgumentException("Staff role cannot be null.");
        }
        this.role = role;
    }

    public String getDepartment() {
        return department;
    }

    public String getTitle() {
        return title;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Staff staff)) return false;
        return Objects.equals(id, staff.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}
