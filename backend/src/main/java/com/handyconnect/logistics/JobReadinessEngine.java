package com.handyconnect.logistics;

import com.handyconnect.booking.Booking;
import com.handyconnect.booking.BookingAssignment;
import com.handyconnect.booking.BookingAssignmentRepository;
import com.handyconnect.handyman.HandymanAvailability;
import com.handyconnect.handyman.HandymanAvailabilityRepository;
import com.handyconnect.handyman.HandymanProfile;
import com.handyconnect.handyman.HandymanProfileRepository;
import com.handyconnect.handyman.HandymanSkill;
import com.handyconnect.handyman.HandymanSkillRepository;
import com.handyconnect.inventory.InventoryBalance;
import com.handyconnect.inventory.InventoryBalanceRepository;
import com.handyconnect.inventory.InventoryLocation;
import com.handyconnect.inventory.InventoryLocationRepository;
import com.handyconnect.servicecatalog.ServiceEntity;
import com.handyconnect.servicecatalog.ServiceMaterial;
import com.handyconnect.servicecatalog.ServiceMaterialRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class JobReadinessEngine {

    private final ServiceMaterialRepository serviceMaterialRepository;
    private final InventoryBalanceRepository balanceRepository;
    private final InventoryLocationRepository locationRepository;
    private final HandymanProfileRepository handymanProfileRepository;
    private final HandymanSkillRepository skillRepository;
    private final HandymanAvailabilityRepository availabilityRepository;
    private final BookingAssignmentRepository assignmentRepository;

    public JobReadinessEngine(ServiceMaterialRepository serviceMaterialRepository,
                              InventoryBalanceRepository balanceRepository,
                              InventoryLocationRepository locationRepository,
                              HandymanProfileRepository handymanProfileRepository,
                              HandymanSkillRepository skillRepository,
                              HandymanAvailabilityRepository availabilityRepository,
                              BookingAssignmentRepository assignmentRepository) {
        this.serviceMaterialRepository = serviceMaterialRepository;
        this.balanceRepository = balanceRepository;
        this.locationRepository = locationRepository;
        this.handymanProfileRepository = handymanProfileRepository;
        this.skillRepository = skillRepository;
        this.availabilityRepository = availabilityRepository;
        this.assignmentRepository = assignmentRepository;
    }

    public JobReadinessEvaluation evaluateBooking(Booking booking) {
        JobReadinessEvaluation eval = new JobReadinessEvaluation();
        List<String> reasons = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();
        List<MaterialReadinessItem> materialItems = new ArrayList<>();

        ServiceEntity service = booking.getService();
        List<ServiceMaterial> requiredMaterials = serviceMaterialRepository.findByServiceId(service.getId());

        // Default primary location is Central City Warehouse (id: 1) or first location
        List<InventoryLocation> locations = locationRepository.findAll();
        InventoryLocation primaryLoc = locations.stream()
                .filter(l -> "LOC-CENTRAL".equalsIgnoreCase(l.getCode()))
                .findFirst()
                .orElse(locations.isEmpty() ? null : locations.get(0));

        boolean allMaterialsAvailableLocally = true;
        boolean allMaterialsAvailableInNetwork = true;
        boolean hasSupplierReplenishmentNeeded = false;

        for (ServiceMaterial sm : requiredMaterials) {
            MaterialReadinessItem itemReadiness = new MaterialReadinessItem();
            itemReadiness.setItemId(sm.getItem().getId());
            itemReadiness.setSku(sm.getItem().getSku());
            itemReadiness.setName(sm.getItem().getName());
            itemReadiness.setRequiredQuantity(sm.getStandardQuantity());

            // Check primary location available stock
            BigDecimal primaryAvail = BigDecimal.ZERO;
            if (primaryLoc != null) {
                primaryAvail = balanceRepository.findByItemIdAndLocationId(sm.getItem().getId(), primaryLoc.getId())
                        .map(InventoryBalance::getAvailableQuantity)
                        .orElse(BigDecimal.ZERO);
            }
            itemReadiness.setAvailableInPrimaryLocation(primaryAvail);

            // Check across all locations
            List<InventoryBalance> allBalances = balanceRepository.findByItemId(sm.getItem().getId());
            BigDecimal totalNetAvail = allBalances.stream()
                    .map(InventoryBalance::getAvailableQuantity)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            itemReadiness.setTotalNetworkAvailable(totalNetAvail);

            if (primaryAvail.compareTo(sm.getStandardQuantity()) >= 0) {
                // Sufficient in primary warehouse
                itemReadiness.setFulfillmentStrategy("LOCAL_RESERVE");
                itemReadiness.setRecommendedLocationId(primaryLoc != null ? primaryLoc.getId() : null);
                itemReadiness.setRecommendedLocationName(primaryLoc != null ? primaryLoc.getName() : "Local Depot");
                itemReadiness.setExplanation(String.format("Stock available at %s (Available: %.2f, Needed: %.2f)",
                        itemReadiness.getRecommendedLocationName(), primaryAvail, sm.getStandardQuantity()));
                recommendations.add(String.format("Reserve %.2f %s of '%s' from %s",
                        sm.getStandardQuantity(), sm.getItem().getUnitOfMeasure(), sm.getItem().getName(), itemReadiness.getRecommendedLocationName()));
            } else if (totalNetAvail.compareTo(sm.getStandardQuantity()) >= 0) {
                // Stock exists in another warehouse -> recommend stock transfer
                allMaterialsAvailableLocally = false;
                InventoryBalance alternateBalance = allBalances.stream()
                        .filter(b -> b.getAvailableQuantity().compareTo(sm.getStandardQuantity()) >= 0)
                        .findFirst()
                        .orElse(null);

                if (alternateBalance != null && alternateBalance.getLocation() != null) {
                    itemReadiness.setFulfillmentStrategy("TRANSFER");
                    itemReadiness.setRecommendedLocationId(alternateBalance.getLocation().getId());
                    itemReadiness.setRecommendedLocationName(alternateBalance.getLocation().getName());
                    itemReadiness.setExplanation(String.format("Transfer needed from %s (Available: %.2f, Needed: %.2f)",
                            alternateBalance.getLocation().getName(), alternateBalance.getAvailableQuantity(), sm.getStandardQuantity()));
                    recommendations.add(String.format("Approve stock transfer of %.2f %s from %s to %s",
                            sm.getStandardQuantity(), sm.getItem().getUnitOfMeasure(),
                            alternateBalance.getLocation().getName(), primaryLoc != null ? primaryLoc.getName() : "Target"));
                } else {
                    itemReadiness.setFulfillmentStrategy("TRANSFER_SPLIT");
                    itemReadiness.setExplanation("Stock available across multiple locations, combined transfer required");
                    recommendations.add(String.format("Split transfer required for '%s'", sm.getItem().getName()));
                }
            } else {
                // Network shortage
                allMaterialsAvailableLocally = false;
                allMaterialsAvailableInNetwork = false;
                hasSupplierReplenishmentNeeded = true;
                itemReadiness.setFulfillmentStrategy("SUPPLIER_REPLENISH");
                itemReadiness.setExplanation(String.format("Material shortage across all locations. Needed: %.2f, Available: %.2f",
                        sm.getStandardQuantity(), totalNetAvail));
                recommendations.add(String.format("Raise urgent purchase requisition for '%s' (%s) with suppliers",
                        sm.getItem().getName(), sm.getItem().getSku()));
            }

            materialItems.add(itemReadiness);
        }
        eval.setMaterialReadiness(materialItems);

        // 2. Evaluate Handymen Eligibility
        List<HandymanProfile> handymen = handymanProfileRepository.findByVerificationStatus("VERIFIED");
        List<HandymanRecommendation> rankedHandymen = new ArrayList<>();
        String scheduledDayOfWeek = booking.getScheduledDate().getDayOfWeek().name();

        for (HandymanProfile hp : handymen) {
            HandymanRecommendation rec = new HandymanRecommendation();
            rec.setHandymanId(hp.getId());
            if (hp.getUser() != null) {
                rec.setUserId(hp.getUser().getId());
                rec.setFullName(hp.getUser().getFullName());
            }
            rec.setVerificationStatus(hp.getVerificationStatus());
            rec.setRatingAvg(hp.getRatingAvg());
            rec.setExperienceYears(hp.getExperienceYears());

            List<String> matchReasons = new ArrayList<>();
            BigDecimal score = BigDecimal.valueOf(20.0); // Baseline for verified profile

            // Check skills match
            List<HandymanSkill> skills = skillRepository.findByHandymanId(hp.getId());
            boolean skillMatched = skills.stream()
                    .anyMatch(s -> s.getCategory().getId().equals(service.getCategory().getId()));
            rec.setSkillsMatch(skillMatched);
            if (skillMatched) {
                score = score.add(BigDecimal.valueOf(40.0));
                matchReasons.add("Possesses verified certification in " + service.getCategory().getName());
            } else {
                matchReasons.add("No specific category certification on file");
            }

            // Check availability schedule
            List<HandymanAvailability> avails = availabilityRepository.findByHandymanIdAndDayOfWeek(hp.getId(), scheduledDayOfWeek);
            boolean available = avails.stream().anyMatch(a -> Boolean.TRUE.equals(a.getIsActive()));
            rec.setAvailabilityMatch(available);
            if (available) {
                score = score.add(BigDecimal.valueOf(20.0));
                matchReasons.add("Scheduled working hours on " + scheduledDayOfWeek);
            } else {
                matchReasons.add("Not rostered for " + scheduledDayOfWeek);
            }

            // Rating addition (0-20 pts)
            if (hp.getRatingAvg() != null) {
                BigDecimal ratingBonus = hp.getRatingAvg().multiply(BigDecimal.valueOf(4.0));
                score = score.add(ratingBonus);
                matchReasons.add(String.format("Customer satisfaction rating: %.1f/5.0 (%d reviews)", hp.getRatingAvg(), hp.getRatingCount()));
            }

            rec.setMatchScore(score.setScale(1, RoundingMode.HALF_UP));
            rec.setMatchReasons(matchReasons);
            rankedHandymen.add(rec);
        }

        rankedHandymen.sort(Comparator.comparing(HandymanRecommendation::getMatchScore).reversed());
        eval.setEligibleHandymen(rankedHandymen);

        boolean hasEligibleHandyman = rankedHandymen.stream()
                .anyMatch(h -> h.isSkillsMatch() && h.isAvailabilityMatch());

        if (!rankedHandymen.isEmpty()) {
            HandymanRecommendation topMatch = rankedHandymen.get(0);
            recommendations.add(String.format("Recommend Handyman '%s' (Score: %.1f%%) for dispatch",
                    topMatch.getFullName(), topMatch.getMatchScore()));
        }

        // 3. Determine Final Readiness Status & Score
        if (hasSupplierReplenishmentNeeded) {
            eval.setReadinessStatus(JobReadinessStatus.BLOCKED);
            eval.setReadinessScore(BigDecimal.valueOf(25.0));
            eval.setSummary("Blocked: Material shortage prevents booking execution. Supplier replenishment required.");
            reasons.add("Required standard materials are out of stock network-wide.");
        } else if (!hasEligibleHandyman) {
            eval.setReadinessStatus(JobReadinessStatus.AT_RISK);
            eval.setReadinessScore(BigDecimal.valueOf(45.0));
            eval.setSummary("At Risk: No available verified handyman with matching skill set on scheduled date.");
            reasons.add("Handyman availability conflict or skill mismatch for scheduled appointment slot.");
        } else if (!allMaterialsAvailableLocally) {
            eval.setReadinessStatus(JobReadinessStatus.PARTIALLY_READY);
            eval.setReadinessScore(BigDecimal.valueOf(75.0));
            eval.setSummary("Partially Ready: Materials are available in another warehouse and require inter-location transfer.");
            reasons.add("Materials require inter-warehouse transfer before job commencement.");
        } else {
            eval.setReadinessStatus(JobReadinessStatus.READY);
            eval.setReadinessScore(BigDecimal.valueOf(98.0));
            eval.setSummary("Fully Ready: All required materials are in stock at primary warehouse and certified handymen are available.");
            reasons.add("Local inventory reserves confirmed and certified technicians available.");
        }

        eval.setReasons(reasons);
        eval.setRecommendations(recommendations);
        return eval;
    }
}
