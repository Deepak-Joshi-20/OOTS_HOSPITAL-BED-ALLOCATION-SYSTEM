package com.blossomcare.hospital.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Centralized Spring Boot REST exception handler converting custom hospital domain
 * exceptions into structured HTTP JSON responses.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler({PatientNotFoundException.class, WardNotFoundException.class, EntityNotFoundException.class})
    public ResponseEntity<Map<String, Object>> handleNotFound(EntityNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, "ENTITY_NOT_FOUND", ex.getMessage());
    }

    @ExceptionHandler(BedUnavailableException.class)
    public ResponseEntity<Map<String, Object>> handleBedUnavailable(BedUnavailableException ex) {
        return buildErrorResponse(HttpStatus.CONFLICT, "BED_UNAVAILABLE", ex.getMessage());
    }

    @ExceptionHandler(InvalidAllocationRequestException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidAllocation(InvalidAllocationRequestException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "INVALID_ALLOCATION_REQUEST", ex.getMessage());
    }

    @ExceptionHandler(UnauthorizedStaffActionException.class)
    public ResponseEntity<Map<String, Object>> handleUnauthorized(UnauthorizedStaffActionException ex) {
        return buildErrorResponse(HttpStatus.FORBIDDEN, "UNAUTHORIZED_STAFF_ACTION", ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, "VALIDATION_ERROR", ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(
            HttpStatus status,
            String code,
            String message
    ) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("errorCode", code);
        body.put("message", message);
        return ResponseEntity.status(status).body(body);
    }
}
