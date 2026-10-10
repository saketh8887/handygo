package com.handyconnect;

import com.handyconnect.booking.BookingStateMachine;
import com.handyconnect.booking.BookingStatus;
import com.handyconnect.common.exception.InvalidStateTransitionException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class BookingStateMachineTest {

    private BookingStateMachine stateMachine;

    @BeforeEach
    void setUp() {
        stateMachine = new BookingStateMachine();
    }

    @Test
    void testValidHappyPathTransitions() {
        assertTrue(stateMachine.isValidTransition(BookingStatus.PENDING, BookingStatus.ASSIGNED));
        assertTrue(stateMachine.isValidTransition(BookingStatus.ASSIGNED, BookingStatus.ACCEPTED));
        assertTrue(stateMachine.isValidTransition(BookingStatus.ACCEPTED, BookingStatus.ON_THE_WAY));
        assertTrue(stateMachine.isValidTransition(BookingStatus.ON_THE_WAY, BookingStatus.ARRIVED));
        assertTrue(stateMachine.isValidTransition(BookingStatus.ARRIVED, BookingStatus.IN_PROGRESS));
        assertTrue(stateMachine.isValidTransition(BookingStatus.IN_PROGRESS, BookingStatus.COMPLETED));
    }

    @Test
    void testWaitingForMaterialsAndCancellationTransitions() {
        assertTrue(stateMachine.isValidTransition(BookingStatus.IN_PROGRESS, BookingStatus.WAITING_FOR_MATERIALS));
        assertTrue(stateMachine.isValidTransition(BookingStatus.WAITING_FOR_MATERIALS, BookingStatus.IN_PROGRESS));
        assertTrue(stateMachine.isValidTransition(BookingStatus.PENDING, BookingStatus.CANCELLED));
        assertTrue(stateMachine.isValidTransition(BookingStatus.ASSIGNED, BookingStatus.CANCELLED));
        assertTrue(stateMachine.isValidTransition(BookingStatus.ACCEPTED, BookingStatus.CANCELLED));
    }

    @Test
    void testInvalidTransitionsThrowException() {
        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(BookingStatus.PENDING, BookingStatus.COMPLETED)
        );

        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(BookingStatus.COMPLETED, BookingStatus.IN_PROGRESS)
        );

        assertThrows(InvalidStateTransitionException.class, () ->
                stateMachine.validateTransition(BookingStatus.CANCELLED, BookingStatus.PENDING)
        );
    }
}
