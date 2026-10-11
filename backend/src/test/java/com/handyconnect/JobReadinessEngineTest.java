package com.handyconnect;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingAssignment;
import com.handyconnect.booking.BookingAssignmentRepository;
import com.handyconnect.customer.Address;
import com.handyconnect.handyman.*;
import com.handyconnect.inventory.InventoryBalance;
import com.handyconnect.inventory.InventoryBalanceRepository;
import com.handyconnect.inventory.InventoryItem;
import com.handyconnect.inventory.InventoryLocation;
import com.handyconnect.inventory.InventoryLocationRepository;
import com.handyconnect.logistics.HandymanRecommendation;
import com.handyconnect.logistics.JobReadinessEngine;
import com.handyconnect.logistics.JobReadinessEvaluation;
import com.handyconnect.logistics.JobReadinessStatus;
import com.handyconnect.servicecatalog.*;
import com.handyconnect.user.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
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

    @Mock
    private ServiceRequiredSkillRepository serviceRequiredSkillRepository;

    @Mock
    private HandymanSpecializationRepository handymanSpecializationRepository;

    @Mock
    private HandymanCertificationRepository certificationRepository;

    @Mock
    private HandymanServiceAreaRepository serviceAreaRepository;

    @Mock
    private com.handyconnect.team.HandymanTeamRepository handymanTeamRepository;

    private JobReadinessEngine readinessEngine;

    @BeforeEach
    void setUp() {
        readinessEngine = new JobReadinessEngine(
                serviceMaterialRepository, balanceRepository, locationRepository,
                handymanProfileRepository, skillRepository, availabilityRepository,
                assignmentRepository, serviceRequiredSkillRepository,
                handymanSpecializationRepository, certificationRepository,
                serviceAreaRepository, handymanTeamRepository
        );
    }

    @Test
    void testSkillBasedEligibilityPlumberQualifiedForPlumbing() {
        // Setup service: Pipe Leak Repair with required skill: Pipe Leakage & Soldering
        ServiceCategory category = new ServiceCategory();
        category.setId(1L);
        category.setName("Plumbing");

        ServiceEntity service = new ServiceEntity();
        service.setId(10L);
        service.setName("Pipe Leak Detection and Repair");
        service.setCategory(category);

        Specialization plumbSpec = new Specialization("Plumbing", "PLUMBING", "Pipes and drainage", "Wrench");
        plumbSpec.setId(1L);

        Skill leakSkill = new Skill(plumbSpec, "Pipe Leakage & Soldering", "SKILL_PLUMB_LEAK", "Soldering pipes");
        leakSkill.setId(101L);

        ServiceRequiredSkill reqSkill = new ServiceRequiredSkill(service, leakSkill, true, "INTERMEDIATE");
        when(serviceRequiredSkillRepository.findByServiceId(10L)).thenReturn(List.of(reqSkill));

        Address address = new Address();
        address.setPostalCode("62704");

        Booking booking = new Booking();
        booking.setId(100L);
        booking.setService(service);
        booking.setAddress(address);
        booking.setScheduledDate(LocalDate.of(2026, 10, 12)); // Monday
        booking.setScheduledTimeSlot("09:00 - 11:00");

        // Setup Plumber technician: Robert Smith
        User plumberUser = new User();
        plumberUser.setId(3L);
        plumberUser.setFullName("Robert Smith");

        HandymanProfile plumberProfile = new HandymanProfile(plumberUser);
        plumberProfile.setId(20L);
        plumberProfile.setVerificationStatus("VERIFIED");
        plumberProfile.setActiveStatus("ACTIVE");
        plumberProfile.setAvailabilityStatus("AVAILABLE");
        plumberProfile.setRatingAvg(BigDecimal.valueOf(4.9));
        plumberProfile.setRatingCount(20);
        plumberProfile.setExperienceYears(8);
        plumberProfile.setMaxActiveWorkload(3);

        when(handymanProfileRepository.findAll()).thenReturn(List.of(plumberProfile));
        when(assignmentRepository.countActiveJobsForHandyman(20L)).thenReturn(0L);

        HandymanSpecialization hs = new HandymanSpecialization(plumberProfile, plumbSpec, true, 8);
        when(handymanSpecializationRepository.findByHandymanId(20L)).thenReturn(List.of(hs));

        HandymanSkill hmSkill = new HandymanSkill(plumberProfile, category, leakSkill, "Pipe Leakage & Soldering", "EXPERT", "License #1", 8);
        when(skillRepository.findByHandymanId(20L)).thenReturn(List.of(hmSkill));

        HandymanAvailability avail = new HandymanAvailability(plumberProfile, "MONDAY", LocalTime.of(8, 0), LocalTime.of(17, 0), true);
        when(availabilityRepository.findByHandymanIdAndDayOfWeek(20L, "MONDAY")).thenReturn(List.of(avail));

        HandymanServiceArea area = new HandymanServiceArea(plumberProfile, "62704", "Springfield", "West End");
        when(serviceAreaRepository.findByHandymanId(20L)).thenReturn(List.of(area));

        when(assignmentRepository.findConflictingAssignments(eq(20L), any(), any())).thenReturn(Collections.emptyList());

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        assertFalse(eval.getEligibleHandymen().isEmpty());
        HandymanRecommendation topMatch = eval.getEligibleHandymen().get(0);
        assertTrue(topMatch.isEligible(), "Plumber should be eligible for plumbing job");
        assertTrue(topMatch.isSkillsMatch());
        assertTrue(topMatch.isAvailabilityMatch());
        assertTrue(topMatch.isServiceAreaMatch());
        assertTrue(topMatch.getMatchScore().doubleValue() >= 80.0, "Score should reflect expert skills and high rating");
        assertNotNull(topMatch.getScoreBreakdown().get("skillsScore"));
        assertNotNull(topMatch.getScoreBreakdown().get("experienceScore"));
    }

    @Test
    void testSkillBasedExclusionPlumberIneligibleForElectrical() {
        // Setup Electrical service requiring Electrical Troubleshooting skill
        ServiceCategory electCategory = new ServiceCategory();
        electCategory.setId(2L);
        electCategory.setName("Electrical");

        ServiceEntity electService = new ServiceEntity();
        electService.setId(20L);
        electService.setName("Circuit Breaker Tripping Diagnostic");
        electService.setCategory(electCategory);

        Specialization electSpec = new Specialization("Electrical", "ELECTRICAL", "Wiring and breakers", "Zap");
        electSpec.setId(2L);

        Skill electSkill = new Skill(electSpec, "Domestic Wiring & Circuit Breakers", "SKILL_ELECT_WIRING", "Wiring");
        electSkill.setId(201L);

        ServiceRequiredSkill reqSkill = new ServiceRequiredSkill(electService, electSkill, true, "EXPERT");
        when(serviceRequiredSkillRepository.findByServiceId(20L)).thenReturn(List.of(reqSkill));

        Booking booking = new Booking();
        booking.setId(101L);
        booking.setService(electService);
        booking.setScheduledDate(LocalDate.of(2026, 10, 12));
        booking.setScheduledTimeSlot("09:00 - 11:00");

        // Handyman: Only has plumbing skills, NO electrical skills
        User purePlumberUser = new User();
        purePlumberUser.setId(4L);
        purePlumberUser.setFullName("Peter Plumber");

        HandymanProfile plumberOnly = new HandymanProfile(purePlumberUser);
        plumberOnly.setId(30L);
        plumberOnly.setVerificationStatus("VERIFIED");
        plumberOnly.setActiveStatus("ACTIVE");
        plumberOnly.setAvailabilityStatus("AVAILABLE");
        plumberOnly.setMaxActiveWorkload(3);

        when(handymanProfileRepository.findAll()).thenReturn(List.of(plumberOnly));
        when(assignmentRepository.countActiveJobsForHandyman(30L)).thenReturn(0L);

        // Only plumbing skill
        Skill plumbSkill = new Skill(new Specialization("Plumbing", "PLUMBING", "Pipes", "Wrench"), "Pipe Repair", "SKILL_PLUMB", "Pipes");
        plumbSkill.setId(101L);
        HandymanSkill hmSkill = new HandymanSkill(plumberOnly, new ServiceCategory(), plumbSkill, "Pipe Repair", "EXPERT", null, 5);
        when(skillRepository.findByHandymanId(30L)).thenReturn(List.of(hmSkill));

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        assertFalse(eval.getEligibleHandymen().isEmpty());
        HandymanRecommendation rec = eval.getEligibleHandymen().get(0);
        assertFalse(rec.isEligible(), "Plumber without electrical skills must be ineligible for electrical job");
        assertFalse(rec.isSkillsMatch());
        assertTrue(rec.getIneligibilityReasons().stream().anyMatch(r -> r.contains("Missing required skill")),
                "Should specifically report missing required electrical skill");
    }

    @Test
    void testUnverifiedHandymanExcluded() {
        ServiceCategory category = new ServiceCategory();
        category.setId(1L);
        category.setName("Plumbing");

        ServiceEntity service = new ServiceEntity();
        service.setId(10L);
        service.setName("Pipe Leak Detection");
        service.setCategory(category);

        Booking booking = new Booking();
        booking.setId(102L);
        booking.setService(service);
        booking.setScheduledDate(LocalDate.of(2026, 10, 12));
        booking.setScheduledTimeSlot("09:00 - 11:00");

        User pendingUser = new User();
        pendingUser.setId(5L);
        pendingUser.setFullName("Pending Tech");

        HandymanProfile unverifiedProfile = new HandymanProfile(pendingUser);
        unverifiedProfile.setId(40L);
        unverifiedProfile.setVerificationStatus("PENDING"); // Unverified!
        unverifiedProfile.setActiveStatus("ACTIVE");

        when(handymanProfileRepository.findAll()).thenReturn(List.of(unverifiedProfile));

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        HandymanRecommendation rec = eval.getEligibleHandymen().get(0);
        assertFalse(rec.isEligible(), "Unverified technician must not be eligible");
        assertTrue(rec.getIneligibilityReasons().stream().anyMatch(r -> r.contains("PENDING")),
                "Should state account is pending verification");
    }

    @Test
    void testHandymanWithConflictingSlotExcluded() {
        ServiceCategory category = new ServiceCategory();
        category.setId(1L);
        category.setName("Plumbing");

        ServiceEntity service = new ServiceEntity();
        service.setId(10L);
        service.setName("Pipe Leak Detection");
        service.setCategory(category);

        Booking booking = new Booking();
        booking.setId(103L);
        booking.setService(service);
        booking.setScheduledDate(LocalDate.of(2026, 10, 12));
        booking.setScheduledTimeSlot("09:00 - 11:00");

        User busyUser = new User();
        busyUser.setId(6L);
        busyUser.setFullName("Busy Tech");

        HandymanProfile busyProfile = new HandymanProfile(busyUser);
        busyProfile.setId(50L);
        busyProfile.setVerificationStatus("VERIFIED");
        busyProfile.setActiveStatus("ACTIVE");
        busyProfile.setAvailabilityStatus("AVAILABLE");
        busyProfile.setMaxActiveWorkload(3);

        when(handymanProfileRepository.findAll()).thenReturn(List.of(busyProfile));

        // Has conflicting active booking assignment on the same date and slot!
        Booking otherBooking = new Booking();
        otherBooking.setId(999L);
        BookingAssignment conflict = new BookingAssignment();
        conflict.setBooking(otherBooking);
        when(assignmentRepository.findConflictingAssignments(50L, LocalDate.of(2026, 10, 12), "09:00 - 11:00"))
                .thenReturn(List.of(conflict));

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        HandymanRecommendation rec = eval.getEligibleHandymen().get(0);
        assertFalse(rec.isEligible(), "Technician with conflicting slot must be excluded");
        assertTrue(rec.getIneligibilityReasons().stream().anyMatch(r -> r.contains("Existing assignment conflict")));
    }

    @Test
    void testHandymanExceedingWorkloadExcluded() {
        ServiceCategory category = new ServiceCategory();
        category.setId(1L);
        category.setName("Plumbing");

        ServiceEntity service = new ServiceEntity();
        service.setId(10L);
        service.setName("Pipe Leak Detection");
        service.setCategory(category);

        Booking booking = new Booking();
        booking.setId(104L);
        booking.setService(service);
        booking.setScheduledDate(LocalDate.of(2026, 10, 12));
        booking.setScheduledTimeSlot("14:00 - 16:00");

        User maxedUser = new User();
        maxedUser.setId(7L);
        maxedUser.setFullName("Overloaded Tech");

        HandymanProfile maxedProfile = new HandymanProfile(maxedUser);
        maxedProfile.setId(60L);
        maxedProfile.setVerificationStatus("VERIFIED");
        maxedProfile.setActiveStatus("ACTIVE");
        maxedProfile.setAvailabilityStatus("AVAILABLE");
        maxedProfile.setMaxActiveWorkload(2); // Max 2 active jobs

        when(handymanProfileRepository.findAll()).thenReturn(List.of(maxedProfile));
        when(assignmentRepository.countActiveJobsForHandyman(60L)).thenReturn(2L); // Currently has 2 active jobs!

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        HandymanRecommendation rec = eval.getEligibleHandymen().get(0);
        assertFalse(rec.isEligible(), "Technician reaching max active workload must be excluded");
        assertTrue(rec.getIneligibilityReasons().stream().anyMatch(r -> r.contains("workload limit reached")));
    }

    @Test
    void testCrossDepartmentRejectionElectricianCannotBeAssignedToACJob() {
        // Setup service with AC & HVAC team
        ServiceCategory category = new ServiceCategory();
        category.setId(6L);
        category.setName("Air Conditioning");

        com.handyconnect.team.ServiceTeam hvacTeam = new com.handyconnect.team.ServiceTeam(
                "AC and HVAC Services Team", "TEAM_HVAC", "Cooling specialists", "Wind"
        );
        hvacTeam.setId(2L);

        ServiceEntity acService = new ServiceEntity();
        acService.setId(8L);
        acService.setName("AC Diagnostic & Refrigerant Top-Up");
        acService.setCategory(category);
        acService.setTeam(hvacTeam);

        Booking booking = new Booking();
        booking.setId(201L);
        booking.setService(acService);
        booking.setScheduledDate(LocalDate.of(2026, 10, 15));
        booking.setScheduledTimeSlot("10:00 - 12:00");

        // Handyman 1 is an Electrician who does NOT belong to AC & HVAC team
        User electricianUser = new User();
        electricianUser.setId(9L);
        electricianUser.setFullName("Ravi Kumar (Electrician)");

        HandymanProfile electricianProfile = new HandymanProfile(electricianUser);
        electricianProfile.setId(5L);
        electricianProfile.setVerificationStatus("VERIFIED");
        electricianProfile.setActiveStatus("ACTIVE");
        electricianProfile.setAvailabilityStatus("AVAILABLE");
        electricianProfile.setMaxActiveWorkload(4);

        when(handymanProfileRepository.findAll()).thenReturn(List.of(electricianProfile));
        // Membership in HVAC team is empty
        when(handymanTeamRepository.findByHandymanIdAndTeamId(5L, 2L)).thenReturn(Optional.empty());

        JobReadinessEvaluation eval = readinessEngine.evaluateBooking(booking);

        assertNotNull(eval);
        HandymanRecommendation rec = eval.getEligibleHandymen().get(0);
        assertFalse(rec.isEligible(), "Electrician must not be eligible for AC and HVAC team jobs");
        assertTrue(rec.getIneligibilityReasons().stream().anyMatch(r -> r.contains("Not a member of assigned department")));
    }
}
