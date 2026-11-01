package com.blossomcare.hospital.model;

import java.time.LocalDateTime;

/**
 * Immutable audit trail record capturing clinical and administrative actions
 * across the Blossom Care Hospital Bed Allocation System.
 */
public final class AuditLogEntry {

    private final String id;
    private final String action;
    private final String category;
    private final String actor;
    private final LocalDateTime timestamp;
    private final String details;

    public AuditLogEntry(
            String id,
            String action,
            String category,
            String actor,
            LocalDateTime timestamp,
            String details
    ) {
        this.id = id;
        this.action = action;
        this.category = category;
        this.actor = actor;
        this.timestamp = timestamp != null ? timestamp : LocalDateTime.now();
        this.details = details;
    }

    public String getId() {
        return id;
    }

    public String getAction() {
        return action;
    }

    public String getCategory() {
        return category;
    }

    public String getActor() {
        return actor;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public String getDetails() {
        return details;
    }

    @Override
    public String toString() {
        return String.format("[%s] (%s) %s — by %s: %s",
                id, category, action, actor, details);
    }
}
