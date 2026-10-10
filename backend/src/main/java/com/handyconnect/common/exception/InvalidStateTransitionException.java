package com.handyconnect.common.exception;

public class InvalidStateTransitionException extends RuntimeException {
    public InvalidStateTransitionException(String message) {
        super(message);
    }
    public InvalidStateTransitionException(String fromState, String toState) {
        super(String.format("Invalid status transition from '%s' to '%s'", fromState, toState));
    }
}
