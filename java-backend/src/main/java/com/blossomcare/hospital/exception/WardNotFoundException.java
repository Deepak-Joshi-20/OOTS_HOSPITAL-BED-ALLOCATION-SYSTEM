package com.blossomcare.hospital.exception;

/**
 * Custom domain exception thrown when a requested Hospital Ward ID cannot be found
 * in the Blossom Care hospital registry.
 */
public class WardNotFoundException extends EntityNotFoundException {

    public WardNotFoundException(String wardId) {
        super("Ward", wardId);
    }
}
