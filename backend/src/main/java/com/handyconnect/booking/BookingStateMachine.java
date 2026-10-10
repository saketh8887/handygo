package com.handyconnect.booking;

import com.handyconnect.common.exception.InvalidStateTransitionException;
import org.springframework.stereotype.Component;

import java.util.*;

@Component
public class BookingStateMachine {

    private final Map<BookingStatus, Set<BookingStatus>> validTransitions = new EnumMap<>(BookingStatus.class);

    public BookingStateMachine() {
        // PENDING can move to ASSIGNED or CANCELLED
        validTransitions.put(BookingStatus.PENDING, EnumSet.of(BookingStatus.ASSIGNED, BookingStatus.CANCELLED));

        // ASSIGNED can move to ACCEPTED, REJECTED, or CANCELLED
        validTransitions.put(BookingStatus.ASSIGNED, EnumSet.of(BookingStatus.ACCEPTED, BookingStatus.REJECTED, BookingStatus.CANCELLED));

        // ACCEPTED can move to ON_THE_WAY, WAITING_FOR_MATERIALS, or CANCELLED
        validTransitions.put(BookingStatus.ACCEPTED, EnumSet.of(BookingStatus.ON_THE_WAY, BookingStatus.WAITING_FOR_MATERIALS, BookingStatus.CANCELLED));

        // ON_THE_WAY can move to ARRIVED, WAITING_FOR_MATERIALS, or CANCELLED
        validTransitions.put(BookingStatus.ON_THE_WAY, EnumSet.of(BookingStatus.ARRIVED, BookingStatus.WAITING_FOR_MATERIALS, BookingStatus.CANCELLED));

        // ARRIVED can move to IN_PROGRESS, WAITING_FOR_MATERIALS, or CANCELLED
        validTransitions.put(BookingStatus.ARRIVED, EnumSet.of(BookingStatus.IN_PROGRESS, BookingStatus.WAITING_FOR_MATERIALS, BookingStatus.CANCELLED));

        // IN_PROGRESS can move to COMPLETED or WAITING_FOR_MATERIALS
        validTransitions.put(BookingStatus.IN_PROGRESS, EnumSet.of(BookingStatus.COMPLETED, BookingStatus.WAITING_FOR_MATERIALS));

        // WAITING_FOR_MATERIALS can resume to IN_PROGRESS, ON_THE_WAY, or CANCELLED
        validTransitions.put(BookingStatus.WAITING_FOR_MATERIALS, EnumSet.of(BookingStatus.IN_PROGRESS, BookingStatus.ON_THE_WAY, BookingStatus.CANCELLED));

        // REJECTED can be re-ASSIGNED or CANCELLED
        validTransitions.put(BookingStatus.REJECTED, EnumSet.of(BookingStatus.ASSIGNED, BookingStatus.CANCELLED));

        // COMPLETED and CANCELLED are terminal states
        validTransitions.put(BookingStatus.COMPLETED, Collections.emptySet());
        validTransitions.put(BookingStatus.CANCELLED, Collections.emptySet());
    }

    public boolean isValidTransition(BookingStatus from, BookingStatus to) {
        if (from == null || to == null) return false;
        Set<BookingStatus> allowed = validTransitions.get(from);
        return allowed != null && allowed.contains(to);
    }

    public void validateTransition(BookingStatus from, BookingStatus to) {
        if (!isValidTransition(from, to)) {
            throw new InvalidStateTransitionException(from != null ? from.name() : "NULL", to != null ? to.name() : "NULL");
        }
    }
}
