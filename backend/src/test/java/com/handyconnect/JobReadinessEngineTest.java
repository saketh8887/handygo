package com.handyconnect;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingAssignmentRepository;
import com.handyconnect.handyman.*;
import com.handyconnect.inventory.InventoryBalance;
import com.handyconnect.inventory.InventoryBalanceRepository;
import com.handyconnect.inventory.InventoryItem;
import com.handyconnect.inventory.InventoryLocation;
import com.handyconnect.inventory.InventoryLocationRepository;
import com.handyconnect.logistics.JobReadinessEngine;
import com.handyconnect.logistics.JobReadinessEvaluation;
import com.handyconnect.logistics.JobReadinessStatus;
import com.handyconnect.servicecatalog.ServiceCategory;
import com.handyconnect.servicecatalog.ServiceEntity;
import com.handyconnect.servicecatalog.ServiceMaterial;
import com.handyconnect.servicecatalog.ServiceMaterialRepository;
import com.handyconnect.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobReadinessEngineTest {

    @Mock
    private ServiceMaterialRepository serviceMaterialRepository;

    @Mock
    private InventoryBalanceRepository balanceRepository;

    @Mock
    private InventoryLocationRepository locationRepository;

    @Mock
    private HandymanProfileRepository handymanProfileRepository;

    @Mock
    private HandymanSkillRepository skillRepository;

    @Mock
    private HandymanAvailabilityRepository availabilityRepository;

    @Mock
    private BookingAssignmentRepository assignmentRepository;

    private JobReadinessEngine readinessEngine;

    @BeforeEach
    void setUp() {
        readinessEngine = new JobReadinessEngine(
                serviceMaterialRepository, balanceRepository, locationRepository,
                handymanProfileRepository, skillRepository, availabilityRepository,
                assignmentRepository
        );
    }

    @Test
    void testBookingReadyWhenMaterialsAndHandymanAvailable() {
        ServiceCategory category = new ServiceCategory();
        category.setId(1L);
        category.setName("Plumbing");

        ServiceEntity service = new ServiceEntity();
        service.setId(10L);
        service.setName("Pipe Leak Repair");
        service.setCategory(category);

        Booking booking = new Booking();
        booking.setId(100L);
        booking.setService(service);
        booking.setScheduledDate(LocalDate.of(2026, 10, 12)); // Monday

        InventoryLocation central = new InventoryLocation();
        central.setId(1L);
        central.setCode("LOC-CENTRAL");
        central.setName("Central City Warehouse");
        when(locationRepository.findAll()).thenReturn(List.of(central));

        InventoryItem pipeItem = new InventoryItem();
        pipeItem.setId(5L);
        pipeItem.setName("PEX Pipe");
        pipeItem.setSku("PEX-01");
        pipeItem.setUnitOfMeasure("PCS");

        ServiceMaterial sm = new ServiceMaterial();
        sm.setItem(pipeItem);
        sm.setStandardQuantity(BigDecimal.valueOf(2.0));
        when(serviceMaterialRepository.findByServiceId(10L)).thenReturn(List.of(sm));

        InventoryBalance balance = new InventoryBalance(pipeItem, central, BigDecimal.valueOf(30.0), BigDecimal.ZERO);
        when(balanceRepository.findByItemIdAndLocationId(5L, 1L)).thenReturn(Optional.of(balance));
        when(balanceRepository.findByItemId(5L)).thenReturn(List.of(balance));

        // Handyman setup
        User handymanUser = new User();
        handymanUser.setId(3L);
        handymanUser.setFullName("Robert Smith");

        HandymanProfile profile = new HandymanProfile(handymanUser);
        profile.setId(20L);
        profile.setVerificationStatus("VERIFIED");
        profile.setRatingAvg(BigDecimal.valueOf(4.9));
        profile.setRatingCount(20);
        when(handymanProfileRepository.findByVerificationStatus("VERIFIED")).thenReturn(List.of(profile));

        HandymanSkill skill = new HandymanSkill(profile, category, "Plumbing Fixes", "Cert #1", 5);
        when(skillRepository.findByHandymanId(20L)).thenReturn(List.of(skill));

        HandymanAvailability avail = new HandymanAvailability(profile, "MONDAY", LocalTime.of(8, 0), LocalTime.of(17, 0), true);
        when(availabilityRepository.findByHandymanIdAndDayOfWeek(20L, "MONDAY")).thenReturn(List.of(avail));

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        assertEquals(JobReadinessStatus.READY, eval.getReadinessStatus());
        assertTrue(eval.getReadinessScore().doubleValue() >= 90.0);
        assertEquals("LOCAL_RESERVE", eval.getMaterialReadiness().get(0).getFulfillmentStrategy());
        assertFalse(eval.getEligibleHandymen().isEmpty());
    }

    @Test
    void testBookingBlockedWhenMaterialsOutOfStock() {
        ServiceCategory category = new ServiceCategory();
        category.setId(1L);
        category.setName("Plumbing");

        ServiceEntity service = new ServiceEntity();
        service.setId(10L);
        service.setName("Pipe Leak Repair");
        service.setCategory(category);

        Booking booking = new Booking();
        booking.setId(100L);
        booking.setService(service);
        booking.setScheduledDate(LocalDate.of(2026, 10, 12));

        InventoryLocation central = new InventoryLocation();
        central.setId(1L);
        central.setCode("LOC-CENTRAL");
        when(locationRepository.findAll()).thenReturn(List.of(central));

        InventoryItem pipeItem = new InventoryItem();
        pipeItem.setId(5L);
        pipeItem.setName("PEX Pipe");
        pipeItem.setSku("PEX-01");

        ServiceMaterial sm = new ServiceMaterial();
        sm.setItem(pipeItem);
        sm.setStandardQuantity(BigDecimal.valueOf(10.0));
        when(serviceMaterialRepository.findByServiceId(10L)).thenReturn(List.of(sm));

        // 0 stock anywhere
        when(balanceRepository.findByItemIdAndLocationId(5L, 1L)).thenReturn(Optional.empty());
        when(balanceRepository.findByItemId(5L)).thenReturn(List.of());

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        assertEquals(JobReadinessStatus.BLOCKED, eval.getReadinessStatus());
        assertEquals("SUPPLIER_REPLENISH", eval.getMaterialReadiness().get(0).getFulfillmentStrategy());
    }
}
