package com.handyconnect.logistics;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingAssignment;
import com.handyconnect.booking.BookingAssignmentRepository;
import com.handyconnect.handyman.*;
import com.handyconnect.inventory.InventoryBalance;
import com.handyconnect.inventory.InventoryBalanceRepository;
import com.handyconnect.inventory.InventoryLocation;
import com.handyconnect.inventory.InventoryLocationRepository;
import com.handyconnect.servicecatalog.*;
import com.handyconnect.team.HandymanTeam;
import com.handyconnect.team.HandymanTeamRepository;
import com.handyconnect.team.ServiceTeam;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class JobReadinessEngine {

    private final ServiceMaterialRepository serviceMaterialRepository;
    private final InventoryBalanceRepository balanceRepository;
    private final InventoryLocationRepository locationRepository;
    private final HandymanProfileRepository handymanProfileRepository;
    private final HandymanSkillRepository skillRepository;
    private final HandymanAvailabilityRepository availabilityRepository;
    private final BookingAssignmentRepository assignmentRepository;
    private final ServiceRequiredSkillRepository serviceRequiredSkillRepository;
    private final HandymanSpecializationRepository handymanSpecializationRepository;
    private final HandymanCertificationRepository certificationRepository;
    private final HandymanServiceAreaRepository serviceAreaRepository;
    private final HandymanTeamRepository handymanTeamRepository;

    public JobReadinessEngine(ServiceMaterialRepository serviceMaterialRepository,
                              InventoryBalanceRepository balanceRepository,
                              InventoryLocationRepository locationRepository,
                              HandymanProfileRepository handymanProfileRepository,
                              HandymanSkillRepository skillRepository,
                              HandymanAvailabilityRepository availabilityRepository,
                              BookingAssignmentRepository assignmentRepository,
                              ServiceRequiredSkillRepository serviceRequiredSkillRepository,
                              HandymanSpecializationRepository handymanSpecializationRepository,
                              HandymanCertificationRepository certificationRepository,
                              HandymanServiceAreaRepository serviceAreaRepository,
                              HandymanTeamRepository handymanTeamRepository) {
        this.serviceMaterialRepository = serviceMaterialRepository;
        this.balanceRepository = balanceRepository;
        this.locationRepository = locationRepository;
        this.handymanProfileRepository = handymanProfileRepository;
        this.skillRepository = skillRepository;
        this.availabilityRepository = availabilityRepository;
        this.assignmentRepository = assignmentRepository;
        this.serviceRequiredSkillRepository = serviceRequiredSkillRepository;
        this.handymanSpecializationRepository = handymanSpecializationRepository;
        this.certificationRepository = certificationRepository;
        this.serviceAreaRepository = serviceAreaRepository;
        this.handymanTeamRepository = handymanTeamRepository;
    }

    public JobReadinessEvaluation evaluateBooking(Booking booking) {
        JobReadinessEvaluation eval = new JobReadinessEvaluation();
        List<String> reasons = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<MaterialReadinessItem> materialItems = new ArrayList<>();

        ServiceEntity service = booking.getService();
        List<ServiceMaterial> requiredMaterials = serviceMaterialRepository.findByServiceId(service.getId());
        List<InventoryLocation> locations = locationRepository.findAll();

        // 1. Evaluate Spare Parts / Material Readiness
        boolean hasSupplierReplenishmentNeeded = false;
        for (ServiceMaterial sm : requiredMaterials) {
            MaterialReadinessItem itemReadiness = new MaterialReadinessItem();
            itemReadiness.setItemId(sm.getItem().getId());
            itemReadiness.setSku(sm.getItem().getSku());
            itemReadiness.setName(sm.getItem().getName());
            itemReadiness.setRequiredQuantity(sm.getStandardQuantity());

            BigDecimal totalNetworkQoh = BigDecimal.ZERO;
            Long optimalLocationId = null;
            String optimalLocationName = null;
            BigDecimal optimalAvailableQty = BigDecimal.ZERO;

            for (InventoryLocation loc : locations) {
                Optional<InventoryBalance> balOpt = balanceRepository.findByItemIdAndLocationId(sm.getItem().getId(), loc.getId());
                if (balOpt.isPresent()) {
                    InventoryBalance bal = balOpt.get();
                    BigDecimal available = bal.getQuantityOnHand().subtract(bal.getReservedQuantity());
                    totalNetworkQoh = totalNetworkQoh.add(bal.getQuantityOnHand());

                    if (available.compareTo(sm.getStandardQuantity()) >= 0 && optimalLocationId == null) {
                        optimalLocationId = loc.getId();
                        optimalLocationName = loc.getName();
                        optimalAvailableQty = available;
                    }
                }
            }

            itemReadiness.setTotalNetworkAvailable(totalNetworkQoh);
            itemReadiness.setAvailableInPrimaryLocation(optimalAvailableQty);

            if (optimalLocationId != null) {
                itemReadiness.setFulfillmentStrategy("LOCAL_RESERVE");
                itemReadiness.setRecommendedLocationId(optimalLocationId);
                itemReadiness.setRecommendedLocationName(optimalLocationName);
                itemReadiness.setExplanation("Sufficient stock reserved at " + optimalLocationName);
            } else if (totalNetworkQoh.compareTo(sm.getStandardQuantity()) >= 0) {
                itemReadiness.setFulfillmentStrategy("HUB_TRANSFER");
                itemReadiness.setExplanation("Stock available across regional hubs; internal stock transfer required");
            } else {
                itemReadiness.setFulfillmentStrategy("SUPPLIER_REPLENISHMENT");
                itemReadiness.setExplanation("Network-wide stockout; purchase requisition required");
                if (Boolean.TRUE.equals(sm.getIsMandatory())) {
                    hasSupplierReplenishmentNeeded = true;
                }
            }
            materialItems.add(itemReadiness);
        }
        eval.setMaterialReadiness(materialItems);

        // 2. Intelligent Handyman Evaluation with Skill-Based Assignment
        List<ServiceRequiredSkill> requiredSkills = serviceRequiredSkillRepository.findByServiceId(service.getId());
        List<HandymanProfile> allHandymen = handymanProfileRepository.findAll();
        List<HandymanRecommendation> evaluatedHandymen = new ArrayList<>();

        String scheduledDayOfWeek = booking.getScheduledDate().getDayOfWeek().name();
        String customerPostalCode = booking.getAddress() != null ? booking.getAddress().getPostalCode() : null;

        for (HandymanProfile hp : allHandymen) {
            HandymanRecommendation rec = new HandymanRecommendation();
            rec.setHandymanId(hp.getId());
            if (hp.getUser() != null) {
                rec.setUserId(hp.getUser().getId());
                rec.setFullName(hp.getUser().getFullName());
            }
            rec.setProfilePhotoUrl(hp.getProfilePhotoUrl());
            rec.setVerificationStatus(hp.getVerificationStatus());
            rec.setRatingAvg(hp.getRatingAvg());
            rec.setRatingCount(hp.getRatingCount() != null ? hp.getRatingCount() : 0);
            rec.setExperienceYears(hp.getExperienceYears() != null ? hp.getExperienceYears() : 0);
            rec.setCompletedJobCount(hp.getCompletedJobCount() != null ? hp.getCompletedJobCount() : 0);

            int maxWorkload = hp.getMaxActiveWorkload() != null ? hp.getMaxActiveWorkload() : 3;
            rec.setMaxWorkload(maxWorkload);
            long activeJobs = assignmentRepository.countActiveJobsForHandyman(hp.getId());
            rec.setActiveWorkload((int) activeJobs);

            // Fetch specializations
            List<HandymanSpecialization> specs = handymanSpecializationRepository.findByHandymanId(hp.getId());
            List<String> specNames = new ArrayList<>();
            String primarySpec = null;
            for (HandymanSpecialization s : specs) {
                if (s.getSpecialization() != null) {
                    specNames.add(s.getSpecialization().getName());
                    if (Boolean.TRUE.equals(s.getIsPrimary())) {
                        primarySpec = s.getSpecialization().getName();
                    }
                }
            }
            if (primarySpec == null && !specNames.isEmpty()) {
                primarySpec = specNames.get(0);
            }
            rec.setPrimarySpecialization(primarySpec != null ? primarySpec : "General Technician");
            rec.setSpecializations(specNames);

            // Fetch handyman skills
            List<HandymanSkill> skills = skillRepository.findByHandymanId(hp.getId());
            Set<Long> verifiedSkillIds = skills.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsVerified()) && s.getSkill() != null)
                    .map(s -> s.getSkill().getId())
                    .collect(Collectors.toSet());
            Set<String> verifiedSkillNames = skills.stream()
                    .filter(s -> Boolean.TRUE.equals(s.getIsVerified()))
                    .map(s -> s.getSkillName().toLowerCase())
                    .collect(Collectors.toSet());

            List<String> ineligibilityReasons = new ArrayList<>();
            List<String> matchReasons = new ArrayList<>();
            List<String> matchedSkillNames = new ArrayList<>();
            List<String> missingSkillNames = new ArrayList<>();

            // A. Mandatory Check: Verification Status
            if (!"VERIFIED".equalsIgnoreCase(hp.getVerificationStatus())) {
                ineligibilityReasons.add("Account is " + hp.getVerificationStatus() + " (Only verified technicians can receive assignments)");
            }

            // B. Mandatory Check: Active Status & Availability Status
            if (!"ACTIVE".equalsIgnoreCase(hp.getActiveStatus())) {
                ineligibilityReasons.add("Technician profile is currently marked INACTIVE");
            }
            if ("ON_LEAVE".equalsIgnoreCase(hp.getAvailabilityStatus()) || "INACTIVE".equalsIgnoreCase(hp.getAvailabilityStatus())) {
                ineligibilityReasons.add("Technician is currently " + hp.getAvailabilityStatus());
            }

            // C. Mandatory Check: Department / Service Team Membership Approval Gate
            ServiceTeam targetTeam = service.getTeam();
            boolean teamMatch = true;
            double teamScoreVal = 0.0;
            if (targetTeam != null) {
                rec.setAssignedTeamName(targetTeam.getName());
                rec.setAssignedTeamCode(targetTeam.getCode());
                Optional<HandymanTeam> membershipOpt = handymanTeamRepository.findByHandymanIdAndTeamId(hp.getId(), targetTeam.getId());
                if (membershipOpt.isEmpty()) {
                    teamMatch = false;
                    rec.setTeamMembershipStatus("NOT_MEMBER");
                    ineligibilityReasons.add("Not a member of assigned department: " + targetTeam.getName());
                } else {
                    HandymanTeam membership = membershipOpt.get();
                    rec.setTeamMembershipStatus(membership.getApprovalStatus());
                    rec.setPrimaryTeam(Boolean.TRUE.equals(membership.getIsPrimary()));

                    if (!"APPROVED".equalsIgnoreCase(membership.getApprovalStatus())) {
                        teamMatch = false;
                        ineligibilityReasons.add("Department membership in '" + targetTeam.getName() + "' is " + membership.getApprovalStatus() + " (Requires Admin Approval)");
                    } else {
                        matchReasons.add("Approved member of " + targetTeam.getName() + (Boolean.TRUE.equals(membership.getIsPrimary()) ? " (Primary Department)" : " (Secondary Department)"));
                        teamScoreVal = Boolean.TRUE.equals(membership.getIsPrimary()) ? 10.0 : 7.0;
                    }
                }
            } else {
                rec.setAssignedTeamName("General Dispatch");
                rec.setTeamMembershipStatus("APPROVED");
                teamScoreVal = 5.0;
            }
            rec.setTeamMatch(teamMatch);

            // D. Mandatory Check: Skill Requirements Matching
            boolean allMandatoryMatched = true;
            if (!requiredSkills.isEmpty()) {
                for (ServiceRequiredSkill req : requiredSkills) {
                    boolean hasSkill = verifiedSkillIds.contains(req.getSkill().getId())
                            || verifiedSkillNames.contains(req.getSkill().getName().toLowerCase());

                    if (hasSkill) {
                        matchedSkillNames.add(req.getSkill().getName());
                    } else {
                        missingSkillNames.add(req.getSkill().getName());
                        if (Boolean.TRUE.equals(req.getIsMandatory())) {
                            allMandatoryMatched = false;
                        }
                    }
                }
            } else {
                // Fallback category check if no individual skills configured
                boolean categoryMatched = skills.stream()
                        .anyMatch(s -> s.getCategory() != null && s.getCategory().getId().equals(service.getCategory().getId()));
                if (categoryMatched) {
                    matchedSkillNames.add(service.getCategory().getName() + " Certified");
                } else {
                    allMandatoryMatched = false;
                    missingSkillNames.add(service.getCategory().getName() + " Trade Skill");
                }
            }

            rec.setSkillsMatch(allMandatoryMatched);
            rec.setMatchedSkills(matchedSkillNames);
            rec.setMissingSkills(missingSkillNames);

            if (!allMandatoryMatched) {
                ineligibilityReasons.add("Missing required skill(s): " + String.join(", ", missingSkillNames));
            } else {
                matchReasons.add("Possesses all verified mandatory skills for " + service.getName());
            }

            // D. Mandatory Check: Working Hours & Schedule for Requested Day
            List<HandymanAvailability> avails = availabilityRepository.findByHandymanIdAndDayOfWeek(hp.getId(), scheduledDayOfWeek);
            boolean availableOnDay = avails.stream().anyMatch(a -> Boolean.TRUE.equals(a.getIsActive()));
            rec.setAvailabilityMatch(availableOnDay);
            if (!availableOnDay) {
                ineligibilityReasons.add("Not rostered for working hours on " + scheduledDayOfWeek);
            } else {
                matchReasons.add("Active working shift scheduled for " + scheduledDayOfWeek);
            }

            // E. Mandatory Check: Double Booking / Conflicting Assignment
            List<BookingAssignment> conflicts = assignmentRepository.findConflictingAssignments(
                    hp.getId(), booking.getScheduledDate(), booking.getScheduledTimeSlot()
            );
            // Ignore conflict if it is the current booking (for re-evaluation)
            boolean hasSlotConflict = conflicts.stream()
                    .anyMatch(c -> !c.getBooking().getId().equals(booking.getId()));
            if (hasSlotConflict) {
                ineligibilityReasons.add("Existing assignment conflict on " + booking.getScheduledDate() + " during slot " + booking.getScheduledTimeSlot());
            }

            // F. Mandatory Check: Workload Limit
            boolean workloadOk = activeJobs < maxWorkload;
            rec.setWorkloadMatch(workloadOk);
            if (!workloadOk) {
                ineligibilityReasons.add(String.format("Active workload limit reached (%d/%d concurrent jobs)", activeJobs, maxWorkload));
            }

            // G. Mandatory Check: Service Area
            List<HandymanServiceArea> areas = serviceAreaRepository.findByHandymanId(hp.getId());
            boolean areaMatch = true;
            if (customerPostalCode != null && !areas.isEmpty()) {
                areaMatch = areas.stream()
                        .anyMatch(a -> Boolean.TRUE.equals(a.getIsActive()) && customerPostalCode.trim().equalsIgnoreCase(a.getPostalCode().trim()));
            }
            rec.setServiceAreaMatch(areaMatch);
            if (!areaMatch) {
                ineligibilityReasons.add("Customer postal code (" + customerPostalCode + ") is outside technician's designated coverage zone");
            } else if (customerPostalCode != null && !areas.isEmpty()) {
                matchReasons.add("Covers customer postal area " + customerPostalCode);
            }

            // Overall Eligibility
            boolean isEligible = ineligibilityReasons.isEmpty();
            rec.setEligible(isEligible);
            rec.setIneligibilityReasons(ineligibilityReasons);

            // H. Calculate Explainable Weighted Scoring (0 - 100 points)
            Map<String, BigDecimal> breakdown = new LinkedHashMap<>();
            BigDecimal totalScore = BigDecimal.ZERO;

            if (isEligible) {
                // 1. Skill Match & Proficiency (Max 35 points)
                BigDecimal skillScore = BigDecimal.valueOf(20.0); // Base match for mandatory skills
                boolean hasExpertSkill = skills.stream()
                        .anyMatch(s -> "EXPERT".equalsIgnoreCase(s.getProficiencyLevel()) || "MASTER".equalsIgnoreCase(s.getProficiencyLevel()));
                if (hasExpertSkill) {
                    skillScore = skillScore.add(BigDecimal.valueOf(10.0));
                    matchReasons.add("Demonstrated EXPERT proficiency in primary required tasks");
                } else {
                    skillScore = skillScore.add(BigDecimal.valueOf(5.0));
                }
                // Check verified certifications
                List<HandymanCertification> certs = certificationRepository.findByHandymanId(hp.getId());
                boolean hasVerifiedCert = certs.stream()
                        .anyMatch(c -> "VERIFIED".equalsIgnoreCase(c.getVerificationStatus()));
                if (hasVerifiedCert) {
                    skillScore = skillScore.add(BigDecimal.valueOf(5.0));
                    matchReasons.add("Holds verified professional state license / certification");
                }
                breakdown.put("skillsScore", skillScore.setScale(1, RoundingMode.HALF_UP));
                totalScore = totalScore.add(skillScore);

                // 2. Experience (Max 20 points)
                int expYears = hp.getExperienceYears() != null ? hp.getExperienceYears() : 0;
                double expPts = Math.min(20.0, expYears * 2.5);
                BigDecimal experienceScore = BigDecimal.valueOf(expPts).setScale(1, RoundingMode.HALF_UP);
                breakdown.put("experienceScore", experienceScore);
                totalScore = totalScore.add(experienceScore);
                matchReasons.add(String.format("%d years verified trade experience", expYears));

                // 3. Availability & Workload (Max 20 points)
                double loadRatio = (double) activeJobs / (double) maxWorkload;
                double loadPts = Math.max(0.0, 20.0 * (1.0 - loadRatio));
                BigDecimal workloadScore = BigDecimal.valueOf(loadPts).setScale(1, RoundingMode.HALF_UP);
                breakdown.put("workloadScore", workloadScore);
                totalScore = totalScore.add(workloadScore);
                matchReasons.add(String.format("Workload capacity: %d/%d active assignments", activeJobs, maxWorkload));

                // 4. Customer Ratings (Max 15 points)
                BigDecimal ratingVal = hp.getRatingAvg() != null ? hp.getRatingAvg() : BigDecimal.valueOf(4.5);
                BigDecimal ratingScore = ratingVal.divide(BigDecimal.valueOf(5.0), 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(15.0)).setScale(1, RoundingMode.HALF_UP);
                breakdown.put("ratingScore", ratingScore);
                totalScore = totalScore.add(ratingScore);
                matchReasons.add(String.format("Customer satisfaction rating: %.1f/5.0 (%d reviews)", ratingVal, rec.getRatingCount()));

                // 5. Proximity / Service Area (Max 10 points)
                BigDecimal locationScore = areaMatch ? BigDecimal.valueOf(10.0) : BigDecimal.valueOf(5.0);
                breakdown.put("locationScore", locationScore);
                totalScore = totalScore.add(locationScore);

                // 6. Department Team Alignment (Max 10 points)
                BigDecimal teamScore = BigDecimal.valueOf(teamScoreVal).setScale(1, RoundingMode.HALF_UP);
                breakdown.put("teamScore", teamScore);
                totalScore = totalScore.add(teamScore);

                rec.setMatchScore(totalScore.setScale(1, RoundingMode.HALF_UP));
            } else {
                // Ineligible candidates receive a base reference score without displacing eligible ones
                breakdown.put("skillsScore", BigDecimal.ZERO);
                breakdown.put("experienceScore", BigDecimal.ZERO);
                breakdown.put("workloadScore", BigDecimal.ZERO);
                breakdown.put("ratingScore", BigDecimal.ZERO);
                breakdown.put("locationScore", BigDecimal.ZERO);
                breakdown.put("teamScore", BigDecimal.ZERO);
                rec.setMatchScore(BigDecimal.ZERO);
            }

            rec.setScoreBreakdown(breakdown);
            rec.setMatchReasons(matchReasons);
            evaluatedHandymen.add(rec);
        }

        // Sort: Eligible first (highest match score descending), followed by ineligible
        evaluatedHandymen.sort((a, b) -> {
            if (a.isEligible() != b.isEligible()) {
                return a.isEligible() ? -1 : 1;
            }
            return b.getMatchScore().compareTo(a.getMatchScore());
        });

        eval.setEligibleHandymen(evaluatedHandymen);

        // Recommendations summary
        List<HandymanRecommendation> eligibleList = evaluatedHandymen.stream()
                .filter(HandymanRecommendation::isEligible)
                .collect(Collectors.toList());

        if (!eligibleList.isEmpty()) {
            HandymanRecommendation topMatch = eligibleList.get(0);
            recommendations.add(String.format("Recommend Handyman '%s' (Score: %.1f%%) — Primary Specialization: %s",
                    topMatch.getFullName(), topMatch.getMatchScore(), topMatch.getPrimarySpecialization()));
        }

        // 3. Determine Final Readiness Status & Summary
        if (hasSupplierReplenishmentNeeded) {
            eval.setReadinessStatus(JobReadinessStatus.BLOCKED);
            eval.setReadinessScore(BigDecimal.valueOf(25.0));
            eval.setSummary("Blocked: Material shortage prevents booking execution. Supplier replenishment required.");
            reasons.add("Required standard materials are out of stock network-wide.");
        } else if (eligibleList.isEmpty()) {
            eval.setReadinessStatus(JobReadinessStatus.AT_RISK);
            eval.setReadinessScore(BigDecimal.valueOf(45.0));
            eval.setSummary("At Risk: No verified technician with matching skills and availability found for this slot.");
            // Add root cause diagnosis
            Set<String> uniqueIssues = new LinkedHashSet<>();
            for (HandymanRecommendation h : evaluatedHandymen) {
                uniqueIssues.addAll(h.getIneligibilityReasons());
            }
            if (!uniqueIssues.isEmpty()) {
                reasons.add("Technician matching constraints: " + String.join("; ", uniqueIssues));
            }
        } else if (requiredMaterials.isEmpty()) {
            eval.setReadinessStatus(JobReadinessStatus.INSPECTION_REQUIRED);
            eval.setReadinessScore(BigDecimal.valueOf(85.0));
            eval.setSummary("Inspection Required: On-site trade diagnosis required before replacement parts can be determined.");
            reasons.add("Service requires on-site technician inspection to determine bill-of-materials and compatible parts.");
        } else {
            eval.setReadinessStatus(JobReadinessStatus.READY);
            eval.setReadinessScore(BigDecimal.valueOf(95.0));
            eval.setSummary("Ready for Dispatch: Qualified, verified technician available and materials secured.");
            reasons.add(String.format("%d verified technician(s) match required skills and schedule.", eligibleList.size()));
        }

        eval.setReasons(reasons);
        eval.setRecommendations(recommendations);
        return eval;
    }
}
