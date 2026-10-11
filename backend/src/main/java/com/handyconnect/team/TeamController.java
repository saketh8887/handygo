package com.handyconnect.team;

import com.handyconnect.booking.BookingDto;
import com.handyconnect.common.dto.ApiResponse;
import com.handyconnect.handyman.HandymanDto;
import com.handyconnect.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
@Tag(name = "Service Teams", description = "Department-Wise Handyman Teams and Specialization Management APIs")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    // --- Public / Authenticated Team Browsing ---

    @GetMapping("/teams")
    @Operation(summary = "Get list of active service teams")
    public ResponseEntity<ApiResponse<List<ServiceTeamDto>>> getActiveTeams() {
        List<ServiceTeamDto> teams = teamService.getActiveTeams();
        return ResponseEntity.ok(ApiResponse.success("Active service teams retrieved", teams));
    }

    @GetMapping("/teams/all")
    @Operation(summary = "Get all service teams including inactive")
    public ResponseEntity<ApiResponse<List<ServiceTeamDto>>> getAllTeams() {
        List<ServiceTeamDto> teams = teamService.getAllTeams();
        return ResponseEntity.ok(ApiResponse.success("All service teams retrieved", teams));
    }

    @GetMapping("/teams/{id}")
    @Operation(summary = "Get service team details with skills and members")
    public ResponseEntity<ApiResponse<ServiceTeamDto>> getTeamById(@PathVariable Long id) {
        ServiceTeamDto team = teamService.getTeamById(id);
        return ResponseEntity.ok(ApiResponse.success("Service team details retrieved", team));
    }

    @GetMapping("/teams/{id}/metrics")
    @Operation(summary = "Get performance and dispatch metrics for a team")
    public ResponseEntity<ApiResponse<TeamMetricsDto>> getTeamMetrics(@PathVariable Long id) {
        TeamMetricsDto metrics = teamService.getTeamMetrics(id);
        return ResponseEntity.ok(ApiResponse.success("Team performance metrics retrieved", metrics));
    }

    @GetMapping("/teams/{id}/members")
    @Operation(summary = "Get all technician members belonging to a team")
    public ResponseEntity<ApiResponse<List<HandymanDto>>> getTeamMembers(@PathVariable Long id) {
        List<HandymanDto> members = teamService.getTeamMembers(id);
        return ResponseEntity.ok(ApiResponse.success("Team members retrieved", members));
    }

    @GetMapping("/teams/{id}/jobs")
    @Operation(summary = "Get active and recent bookings handled by a team")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getTeamJobs(@PathVariable Long id) {
        List<BookingDto> jobs = teamService.getTeamJobs(id);
        return ResponseEntity.ok(ApiResponse.success("Team bookings retrieved", jobs));
    }

    // --- Handyman Team Application ---

    @PostMapping("/handyman/teams/request")
    @PreAuthorize("hasRole('HANDYMAN')")
    @Operation(summary = "Handyman applies to join a specialized service team")
    public ResponseEntity<ApiResponse<HandymanTeamDto>> requestJoinTeam(@RequestBody Map<String, Object> body) {
        Long teamId = Long.valueOf(body.get("teamId").toString());
        String notes = body.getOrDefault("notes", "Technician requested team membership").toString();
        Long userId = SecurityUtils.getCurrentUserId();
        HandymanTeamDto result = teamService.requestJoinTeam(userId, teamId, notes);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Membership request submitted for administrator review", result));
    }

    // --- Administrator Team Management ---

    @PostMapping("/admin/teams")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new service team department (Admin)")
    public ResponseEntity<ApiResponse<ServiceTeamDto>> createTeam(@Valid @RequestBody TeamCreateRequest req) {
        ServiceTeamDto created = teamService.createTeam(req);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Service team created successfully", created));
    }

    @PutMapping("/admin/teams/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing service team (Admin)")
    public ResponseEntity<ApiResponse<ServiceTeamDto>> updateTeam(@PathVariable Long id, @Valid @RequestBody TeamCreateRequest req) {
        ServiceTeamDto updated = teamService.updateTeam(id, req);
        return ResponseEntity.ok(ApiResponse.success("Service team updated successfully", updated));
    }

    @PostMapping("/admin/teams/{id}/skills")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign a skill to a service team (Admin)")
    public ResponseEntity<ApiResponse<TeamSkillDto>> assignSkill(@PathVariable Long id, @RequestBody Map<String, Long> body) {
        Long skillId = body.get("skillId");
        TeamSkillDto result = teamService.assignSkillToTeam(id, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill assigned to team", result));
    }

    @DeleteMapping("/admin/teams/{id}/skills/{skillId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove a skill from a service team (Admin)")
    public ResponseEntity<ApiResponse<Void>> removeSkill(@PathVariable Long id, @PathVariable Long skillId) {
        teamService.removeSkillFromTeam(id, skillId);
        return ResponseEntity.ok(ApiResponse.success("Skill removed from team", null));
    }

    @PostMapping("/admin/teams/{id}/members")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Add or update technician membership in a team (Admin)")
    public ResponseEntity<ApiResponse<HandymanTeamDto>> addMember(@PathVariable Long id, @Valid @RequestBody TeamMemberRequest req) {
        Long adminId = SecurityUtils.getCurrentUserId();
        HandymanTeamDto result = teamService.addMemberToTeam(id, req, adminId);
        return ResponseEntity.ok(ApiResponse.success("Technician added to team", result));
    }

    @PatchMapping("/admin/teams/{id}/members/{handymanId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Approve or reject technician membership in a team (Admin)")
    public ResponseEntity<ApiResponse<HandymanTeamDto>> updateMemberStatus(@PathVariable Long id,
                                                                           @PathVariable Long handymanId,
                                                                           @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("approvalStatus", "APPROVED");
        Long adminId = SecurityUtils.getCurrentUserId();
        HandymanTeamDto result = teamService.updateMemberStatus(id, handymanId, status, adminId);
        return ResponseEntity.ok(ApiResponse.success("Technician membership updated to " + status, result));
    }

    @DeleteMapping("/admin/teams/{id}/members/{handymanId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Remove technician from team (Admin)")
    public ResponseEntity<ApiResponse<Void>> removeMember(@PathVariable Long id, @PathVariable Long handymanId) {
        teamService.removeMemberFromTeam(id, handymanId);
        return ResponseEntity.ok(ApiResponse.success("Technician removed from team", null));
    }

    @GetMapping("/admin/teams/pending-memberships")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all pending team membership requests awaiting approval (Admin)")
    public ResponseEntity<ApiResponse<List<HandymanTeamDto>>> getPendingMemberships() {
        List<HandymanTeamDto> pending = teamService.getPendingMemberships();
        return ResponseEntity.ok(ApiResponse.success("Pending team memberships retrieved", pending));
    }
}
