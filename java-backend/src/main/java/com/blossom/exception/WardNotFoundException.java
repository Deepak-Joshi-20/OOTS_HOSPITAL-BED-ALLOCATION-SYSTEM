package com.blossom.exception;

/**
 * Custom domain exception thrown when a requested Ward ID cannot be found
 * in the Blossom Care registry.
 */
public class WardNotFoundException extends RuntimeException {

    private final String wardId;

    public WardNotFoundException(String wardId) {
        super(String.format("Ward with ID '%s' was not found in the Blossom Care registry.", wardId));
        this.wardId = wardId;
    }

    public String getWardId() {
        return wardId;
    }
}
