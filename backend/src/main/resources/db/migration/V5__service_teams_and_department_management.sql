-- HandyConnect Migration V5: Department-Wise Handyman Teams and Skill-Based Job Assignment

-- 1. SERVICE TEAMS (DEPARTMENTS) TABLE
CREATE TABLE IF NOT EXISTS service_teams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Users',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. TEAM SKILLS MAPPING (Many-to-Many: Service Teams to Skills)
CREATE TABLE IF NOT EXISTS team_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    team_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ts_team FOREIGN KEY (team_id) REFERENCES service_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_ts_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uq_team_skill UNIQUE (team_id, skill_id),
    INDEX idx_ts_team (team_id),
    INDEX idx_ts_skill (skill_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. HANDYMAN TEAMS MAPPING (Many-to-Many: Handymen to Service Teams with Approval & Primary Flag)
CREATE TABLE IF NOT EXISTS handyman_teams (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    handyman_id BIGINT NOT NULL,
    team_id BIGINT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'APPROVED', -- PENDING, APPROVED, REJECTED
    approved_by_user_id BIGINT NULL,
    approved_at TIMESTAMP NULL,
    notes TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ht_handyman FOREIGN KEY (handyman_id) REFERENCES handyman_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_ht_team FOREIGN KEY (team_id) REFERENCES service_teams(id) ON DELETE CASCADE,
    CONSTRAINT fk_ht_approved_by FOREIGN KEY (approved_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uq_handyman_team UNIQUE (handyman_id, team_id),
    INDEX idx_ht_handyman (handyman_id),
    INDEX idx_ht_team (team_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. LINK SERVICES TABLE TO SERVICE TEAMS
ALTER TABLE services
    ADD COLUMN team_id BIGINT NULL,
    ADD CONSTRAINT fk_service_team FOREIGN KEY (team_id) REFERENCES service_teams(id) ON DELETE SET NULL;

-- 5. SEED INITIAL 7 CORE SERVICE TEAMS
INSERT INTO service_teams (id, name, code, description, icon_name, is_active) VALUES
(1, 'Electrical Services Team', 'TEAM_ELECTRICAL', 'Specialized electrical engineers and licensed wiremen handling domestic wiring, switchboards, fixtures, breaker diagnostics, and circuit repairs.', 'Zap', TRUE),
(2, 'AC and HVAC Services Team', 'TEAM_HVAC', 'Certified climate control specialists handling split/window AC servicing, refrigerant recovery, compressor maintenance, and cooling repairs.', 'Wind', TRUE),
(3, 'Plumbing Services Team', 'TEAM_PLUMBING', 'Licensed plumbers for water supply networks, sanitary fixtures, drain unblocking, pressure pipe fitting, and leak detection.', 'Wrench', TRUE),
(4, 'Carpentry Team', 'TEAM_CARPENTRY', 'Architectural joiners and master woodworkers handling door lock mortising, cabinetry installation, furniture repair, and precision woodwork.', 'Hammer', TRUE),
(5, 'Appliance Repair Team', 'TEAM_APPLIANCE', 'Diagnostic technicians repairing washing machines, refrigerators, microwaves, water heaters, and kitchen chimneys.', 'Cpu', TRUE),
(6, 'Painting Team', 'TEAM_PAINTING', 'Professional surface finishers handling interior coatings, exterior weather shielding, waterproofing primers, and texture painting.', 'Paintbrush', TRUE),
(7, 'General Maintenance Team', 'TEAM_GENERAL', 'Multi-skilled technicians handling drywall patching, curtain mounting, silicone grouting, mirror installation, and minor home adjustments.', 'Tool', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), icon_name = VALUES(icon_name);

-- 6. SEED COMPREHENSIVE SKILLS FOR ALL 7 DEPARTMENTS
INSERT INTO skills (id, specialization_id, name, code, description, is_active) VALUES
-- Plumbing additions
(14, 1, 'Pipe Installation & Fitting', 'SKILL_PLUMB_PIPE', 'Water supply line installation, PEX & CPVC routing, and high-pressure fittings', TRUE),
(15, 1, 'Bathroom Plumbing & Sanitary Fixtures', 'SKILL_PLUMB_BATH', 'Toilet flush cisterns, shower mixers, sink traps, and sanitary drainage', TRUE),
-- Electrical additions
(16, 2, 'Switch and Socket Repairs', 'SKILL_ELECT_SWITCH', 'Wall switchboard replacement, dimmer modules, modular socket repairs', TRUE),
(17, 2, 'Electrical Fault Diagnosis', 'SKILL_ELECT_FAULT', 'Multimeter isolation diagnostics, neutral fault detection, ground fault tracing', TRUE),
-- Carpentry additions
(18, 3, 'Door Repairs & Frame Alignment', 'SKILL_CARP_DOOR', 'Door sag correction, hinge rebating, threshold leveling, jamb alignment', TRUE),
(19, 3, 'Wood Polishing & Refinishing', 'SKILL_CARP_POLISH', 'Varnish coat application, polyurethane finishing, wood scratch restoration', TRUE),
-- HVAC additions
(20, 4, 'AC Installation & Mounting', 'SKILL_HVAC_INSTALL', 'Indoor and outdoor split AC unit bracket mounting, copper piping vacuum test', TRUE),
(21, 4, 'AC Leak Diagnosis & Sealing', 'SKILL_HVAC_LEAK', 'Nitrogen pressure testing, electronic sniffer leak detection, coil brazing', TRUE),
-- Appliance Repair (spec 5)
(22, 5, 'Washing Machine Repair', 'SKILL_APPL_WASHER', 'Drum bearing replacement, drain pump unblocking, control board diagnostics', TRUE),
(23, 5, 'Refrigerator Repair', 'SKILL_APPL_FRIDGE', 'Compressor starting relay, defrost timer, capillary tube flushing, thermostat', TRUE),
(24, 5, 'Microwave Repair', 'SKILL_APPL_MICRO', 'Magnetron testing, high voltage diode replacement, door interlock switch repair', TRUE),
(25, 5, 'Water Heater Repair', 'SKILL_APPL_HEATER', 'Heating element replacement, thermostat calibration, sacrificial anode rod', TRUE),
(26, 5, 'Kitchen Chimney Service', 'SKILL_APPL_CHIMNEY', 'Baffle filter degreasing, motor carbon brush replacement, duct cleaning', TRUE),
-- Painting additions (spec 6)
(27, 6, 'Exterior Painting & Weather Shield', 'SKILL_PAINT_EXTERIOR', 'High-pressure wall washing, exterior acrylic emulsion, UV shield coating', TRUE),
(28, 6, 'Wall Putty and Primer Preparation', 'SKILL_PAINT_PUTTY', 'Base surface leveling, two-coat acrylic putty application, zero-grit sanding', TRUE),
(29, 6, 'Texture Painting & Accent Wall', 'SKILL_PAINT_TEXTURE', 'Rustic metallic textures, stencil patterning, protective clear glaze', TRUE),
-- General Maintenance additions (spec 7)
(30, 7, 'Curtain Rod Installation', 'SKILL_GEN_CURTAIN', 'Precision masonry anchor drilling, bracket leveling, double rod mounting', TRUE),
(31, 7, 'Mirror and Frame Mounting', 'SKILL_GEN_MIRROR', 'Heavy antique mirror anchor mounting, laser leveling, picture hanging', TRUE),
(32, 7, 'Grouting and Silicone Sealing', 'SKILL_GEN_GROUT', 'Shower tile regrouting, anti-fungal silicone bead caulking, bathtub edging', TRUE),
(33, 7, 'Miscellaneous Odd Jobs & Patching', 'SKILL_GEN_ODD', 'Door stop installation, loose doorknob fixing, shelf bracket anchoring', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description);

-- 7. MAP SKILLS TO SERVICE TEAMS
INSERT INTO team_skills (team_id, skill_id) VALUES
-- Team 1: Electrical Services Team
(1, 4),  -- Domestic Wiring & Circuit Breakers
(1, 5),  -- Ceiling Fan & Fixture Installation
(1, 6),  -- Electrical Troubleshooting & Safety
(1, 16), -- Switch and Socket Repairs
(1, 17), -- Electrical Fault Diagnosis
-- Team 2: AC and HVAC Services Team
(2, 9),  -- AC Diagnostics & Refrigerant Servicing
(2, 10), -- Air Conditioner Coil & Filter Maintenance
(2, 20), -- AC Installation & Mounting
(2, 21), -- AC Leak Diagnosis & Sealing
-- Team 3: Plumbing Services Team
(3, 1),  -- Pipe Leakage & Soldering
(3, 2),  -- Drain Unblocking & Jetting
(3, 3),  -- Faucet & Fixture Replacement
(3, 14), -- Pipe Installation & Fitting
(3, 15), -- Bathroom Plumbing & Sanitary Fixtures
-- Team 4: Carpentry Team
(4, 7),  -- Locksmithing & Security Deadbolts
(4, 8),  -- Furniture & Cabinet Assembly
(4, 18), -- Door Repairs & Frame Alignment
(4, 19), -- Wood Polishing & Refinishing
-- Team 5: Appliance Repair Team
(5, 22), -- Washing Machine Repair
(5, 23), -- Refrigerator Repair
(5, 24), -- Microwave Repair
(5, 25), -- Water Heater Repair
(5, 26), -- Kitchen Chimney Service
-- Team 6: Painting Team
(6, 11), -- Interior Finishing & Roll Painting
(6, 12), -- Waterproof Primer Application
(6, 27), -- Exterior Painting & Weather Shield
(6, 28), -- Wall Putty and Primer Preparation
(6, 29), -- Texture Painting & Accent Wall
-- Team 7: General Maintenance Team
(7, 13), -- Drywall & Plaster Repair
(7, 30), -- Curtain Rod Installation
(7, 31), -- Mirror and Frame Mounting
(7, 32), -- Grouting and Silicone Sealing
(7, 33)  -- Miscellaneous Odd Jobs & Patching
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

-- 8. MAP EXISTING SERVICES TO CORRESPONDING SERVICE TEAMS
UPDATE services SET team_id = 3 WHERE id IN (1, 2); -- Plumbing services -> Team 3
UPDATE services SET team_id = 1 WHERE id IN (3, 4); -- Electrical services -> Team 1
UPDATE services SET team_id = 4 WHERE id IN (5, 6); -- Carpentry services -> Team 4
UPDATE services SET team_id = 6 WHERE id = 7;      -- Painting service -> Team 6
UPDATE services SET team_id = 2 WHERE id = 8;      -- AC & HVAC service -> Team 2

-- Seed new services for Appliance Repair and General Maintenance
INSERT INTO services (id, category_id, team_id, name, code, description, indicative_base_price, estimated_duration_minutes, required_skills, is_active) VALUES
(9, 4, 5, 'Washing Machine Drum & Motor Diagnostics', 'SRV-APPL-WASHER', 'Comprehensive motor diagnostic, vibration dampener check, belt tensioning, and electronic control board repair.', 65.00, 60, 'Washing Machine Repair', TRUE),
(10, 4, 5, 'Refrigerator Cooling Diagnostic & Gas Service', 'SRV-APPL-FRIDGE', 'Thermostat inspection, relay switch test, refrigerant cycle analysis, and coil cleaning.', 75.00, 75, 'Refrigerator Repair', TRUE),
(11, 7, 7, 'Drywall Patching & Home Fixture Mounting', 'SRV-GEN-PATCH', 'Hole patching, drywall compound sanding, mirror mounting, curtain rod installation, and gap silicone caulking.', 45.00, 60, 'Drywall & Plaster Repair, Curtain Rod Installation', TRUE)
ON DUPLICATE KEY UPDATE team_id = VALUES(team_id);

-- Link required skills for new services
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(9, 22, TRUE, 'INTERMEDIATE'),
(10, 23, TRUE, 'EXPERT'),
(11, 13, TRUE, 'INTERMEDIATE'),
(11, 30, FALSE, 'BEGINNER')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- 9. MAP EXISTING DEMO HANDYMEN TO SERVICE TEAMS
-- Handyman 1 (Robert Smith - Plumber & Electrician)
INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(1, 3, TRUE, 'APPROVED', 1, NOW(), 'Founding master plumber member'),
(1, 1, FALSE, 'APPROVED', 1, NOW(), 'Secondary licensed residential electrical technician')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- Handyman 2 (David Miller - Carpenter & Painter)
INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(2, 4, TRUE, 'APPROVED', 1, NOW(), 'Master carpenter and architectural joiner'),
(2, 6, FALSE, 'APPROVED', 1, NOW(), 'Approved surface coating and painting specialist')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- Handyman 3 (Carlos Reyes - HVAC Specialist)
INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(3, 2, TRUE, 'APPROVED', 1, NOW(), 'EPA Universal certified lead AC technician')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- Handyman 4 (Marcus Cole - Pending Review)
INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, notes) VALUES
(4, 3, TRUE, 'PENDING', 'Pending trade apprentice license verification')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- 10. SEED SPECIFIED DEMO HANDYMEN FOR MAJOR DEPARTMENTS

-- A. Ravi Kumar: Electrician (Electrical Services Team)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(9, 'ravi.electrician@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Ravi Kumar (Electrician)', '+1-555-0305', 'ROLE_HANDYMAN', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES (9, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, verified_at, verified_by_user_id, hourly_rate, service_radius_km, rating_avg, rating_count, max_active_workload, availability_status, completed_job_count) VALUES
(5, 9, 7, 'Certified Industrial & Residential Electrician specializing in breaker panels, surge suppression, switchboards, and fan wiring.', 'Downtown, Springfield West, Eastgate', 'VERIFIED', NOW(), 1, 48.00, 30.00, 4.92, 38, 4, 'AVAILABLE', 38)
ON DUPLICATE KEY UPDATE verification_status = 'VERIFIED';

INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(5, 2, TRUE, 7) -- Electrical
ON DUPLICATE KEY UPDATE is_primary = TRUE;

INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(5, 2, 'Domestic Wiring & Circuit Breakers', 4, 'EXPERT', 'State Wireman License #EL-5502', 7, TRUE),
(5, 2, 'Ceiling Fan & Fixture Installation', 5, 'EXPERT', 'State Wireman License #EL-5502', 7, TRUE),
(5, 2, 'Electrical Troubleshooting & Safety', 6, 'EXPERT', 'OSHA Electrical Safety #OSH-112', 7, TRUE),
(5, 2, 'Switch and Socket Repairs', 16, 'EXPERT', 'State Wireman License #EL-5502', 7, TRUE),
(5, 2, 'Electrical Fault Diagnosis', 17, 'EXPERT', 'Diagnostic Electrical Inspector #DEI-901', 7, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time, is_active) VALUES
(5, 'MONDAY', '08:00:00', '18:00:00', TRUE),
(5, 'TUESDAY', '08:00:00', '18:00:00', TRUE),
(5, 'WEDNESDAY', '08:00:00', '18:00:00', TRUE),
(5, 'THURSDAY', '08:00:00', '18:00:00', TRUE),
(5, 'FRIDAY', '08:00:00', '18:00:00', TRUE),
(5, 'SATURDAY', '09:00:00', '16:00:00', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(5, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(5, '62703', 'Springfield', 'Industrial Parkway & South', TRUE),
(5, '62701', 'Springfield', 'Downtown Capitol District', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(5, 1, TRUE, 'APPROVED', 1, NOW(), 'Lead Electrician for Electrical Services Team')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- B. Arjun Reddy: AC Technician (AC and HVAC Services Team)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(10, 'arjun.hvac@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Arjun Reddy (AC Technician)', '+1-555-0306', 'ROLE_HANDYMAN', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES (10, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, verified_at, verified_by_user_id, hourly_rate, service_radius_km, rating_avg, rating_count, max_active_workload, availability_status, completed_job_count) VALUES
(6, 10, 8, 'Senior HVAC and Air Conditioning diagnostic engineer. Specialist in inverter split units, R32 gas recharging, and coil brazing.', 'All Springfield Metro & Suburbs', 'VERIFIED', NOW(), 1, 52.00, 35.00, 4.95, 42, 4, 'AVAILABLE', 42)
ON DUPLICATE KEY UPDATE verification_status = 'VERIFIED';

INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(6, 4, TRUE, 8) -- HVAC
ON DUPLICATE KEY UPDATE is_primary = TRUE;

INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(6, 6, 'AC Diagnostics & Refrigerant Servicing', 9, 'EXPERT', 'EPA Universal HVAC #608-4421', 8, TRUE),
(6, 6, 'Air Conditioner Coil & Filter Maintenance', 10, 'EXPERT', 'Carrier Master Tech #CAR-771', 8, TRUE),
(6, 6, 'AC Installation & Mounting', 20, 'EXPERT', 'EPA Universal HVAC #608-4421', 8, TRUE),
(6, 6, 'AC Leak Diagnosis & Sealing', 21, 'EXPERT', 'Daikin Certified Specialist', 8, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time, is_active) VALUES
(6, 'MONDAY', '08:00:00', '18:00:00', TRUE),
(6, 'TUESDAY', '08:00:00', '18:00:00', TRUE),
(6, 'WEDNESDAY', '08:00:00', '18:00:00', TRUE),
(6, 'THURSDAY', '08:00:00', '18:00:00', TRUE),
(6, 'FRIDAY', '08:00:00', '18:00:00', TRUE),
(6, 'SATURDAY', '09:00:00', '17:00:00', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(6, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(6, '62703', 'Springfield', 'Industrial Parkway & South', TRUE),
(6, '62701', 'Springfield', 'Downtown Capitol District', TRUE),
(6, '62702', 'Springfield', 'North Grand & Ridge', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(6, 2, TRUE, 'APPROVED', 1, NOW(), 'Lead AC Engineer for AC and HVAC Services Team')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- C. Suresh Kumar: Plumber (Plumbing Services Team)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(11, 'suresh.plumber@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Suresh Kumar (Plumber)', '+1-555-0307', 'ROLE_HANDYMAN', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES (11, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, verified_at, verified_by_user_id, hourly_rate, service_radius_km, rating_avg, rating_count, max_active_workload, availability_status, completed_job_count) VALUES
(7, 11, 10, 'Certified Master Plumber with a decade of expertise in commercial piping, hydro-jet drain snaking, leak detection, and sanitary replacements.', 'Springfield West, South Valley, Downtown', 'VERIFIED', NOW(), 1, 46.00, 30.00, 4.89, 56, 4, 'AVAILABLE', 56)
ON DUPLICATE KEY UPDATE verification_status = 'VERIFIED';

INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(7, 1, TRUE, 10) -- Plumbing
ON DUPLICATE KEY UPDATE is_primary = TRUE;

INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(7, 1, 'Pipe Leakage & Soldering', 1, 'EXPERT', 'Master Plumber License #MP-8831', 10, TRUE),
(7, 1, 'Drain Unblocking & Jetting', 2, 'EXPERT', 'Master Plumber License #MP-8831', 10, TRUE),
(7, 1, 'Faucet & Fixture Replacement', 3, 'EXPERT', 'Master Plumber License #MP-8831', 10, TRUE),
(7, 1, 'Pipe Installation & Fitting', 14, 'EXPERT', 'Master Plumber License #MP-8831', 10, TRUE),
(7, 1, 'Bathroom Plumbing & Sanitary Fixtures', 15, 'EXPERT', 'Master Plumber License #MP-8831', 10, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time, is_active) VALUES
(7, 'MONDAY', '08:00:00', '18:00:00', TRUE),
(7, 'TUESDAY', '08:00:00', '18:00:00', TRUE),
(7, 'WEDNESDAY', '08:00:00', '18:00:00', TRUE),
(7, 'THURSDAY', '08:00:00', '18:00:00', TRUE),
(7, 'FRIDAY', '08:00:00', '18:00:00', TRUE),
(7, 'SATURDAY', '08:00:00', '15:00:00', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(7, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(7, '62703', 'Springfield', 'Industrial Parkway & South', TRUE),
(7, '62701', 'Springfield', 'Downtown Capitol District', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(7, 3, TRUE, 'APPROVED', 1, NOW(), 'Senior Plumber for Plumbing Services Team')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- D. Rahul Sharma: Carpenter (Carpentry Team)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(12, 'rahul.carpenter@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Rahul Sharma (Carpenter)', '+1-555-0308', 'ROLE_HANDYMAN', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES (12, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, verified_at, verified_by_user_id, hourly_rate, service_radius_km, rating_avg, rating_count, max_active_workload, availability_status, completed_job_count) VALUES
(8, 12, 6, 'Artisan woodworker and furniture specialist. Expert in door mortise locks, hidden hinge alignments, modular kitchen cabinets, and wood polishing.', 'Westside, Downtown, Eastgate', 'VERIFIED', NOW(), 1, 44.00, 28.00, 4.88, 31, 3, 'AVAILABLE', 31)
ON DUPLICATE KEY UPDATE verification_status = 'VERIFIED';

INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(8, 3, TRUE, 6) -- Carpentry
ON DUPLICATE KEY UPDATE is_primary = TRUE;

INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(8, 3, 'Locksmithing & Security Deadbolts', 7, 'EXPERT', 'Associated Locksmiths Cert #AL-993', 6, TRUE),
(8, 3, 'Furniture & Cabinet Assembly', 8, 'EXPERT', 'Woodworking Guild Fellow', 6, TRUE),
(8, 3, 'Door Repairs & Frame Alignment', 18, 'EXPERT', 'Architectural Joinery Standard #AJS-20', 6, TRUE),
(8, 3, 'Wood Polishing & Refinishing', 19, 'EXPERT', 'Fine Wood Finishing Diploma', 6, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time, is_active) VALUES
(8, 'MONDAY', '08:30:00', '17:30:00', TRUE),
(8, 'TUESDAY', '08:30:00', '17:30:00', TRUE),
(8, 'WEDNESDAY', '08:30:00', '17:30:00', TRUE),
(8, 'THURSDAY', '08:30:00', '17:30:00', TRUE),
(8, 'FRIDAY', '08:30:00', '17:30:00', TRUE),
(8, 'SATURDAY', '09:00:00', '15:00:00', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(8, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(8, '62703', 'Springfield', 'Industrial Parkway & South', TRUE),
(8, '62701', 'Springfield', 'Downtown Capitol District', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(8, 4, TRUE, 'APPROVED', 1, NOW(), 'Core Carpenter for Carpentry Team')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- E. Priya Nair: Appliance Repair Technician (Appliance Repair Team)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(13, 'priya.appliance@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Priya Nair (Appliance Specialist)', '+1-555-0309', 'ROLE_HANDYMAN', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES (13, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, verified_at, verified_by_user_id, hourly_rate, service_radius_km, rating_avg, rating_count, max_active_workload, availability_status, completed_job_count) VALUES
(9, 13, 7, 'Factory-trained major appliance engineer. Diagnostics and component-level repairs on washing machines, inverter refrigerators, dishwashers, and microwave ovens.', 'Springfield Central, West, North Hills', 'VERIFIED', NOW(), 1, 50.00, 32.00, 4.96, 49, 4, 'AVAILABLE', 49)
ON DUPLICATE KEY UPDATE verification_status = 'VERIFIED';

INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(9, 5, TRUE, 7) -- Appliance Repair
ON DUPLICATE KEY UPDATE is_primary = TRUE;

INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(9, 4, 'Washing Machine Repair', 22, 'EXPERT', 'NASTeC Major Appliance Master #NAST-789', 7, TRUE),
(9, 4, 'Refrigerator Repair', 23, 'EXPERT', 'Refrigeration System Specialist #RSS-402', 7, TRUE),
(9, 4, 'Microwave Repair', 24, 'EXPERT', 'Electronic Appliance Service Cert', 7, TRUE),
(9, 4, 'Water Heater Repair', 25, 'INTERMEDIATE', 'Water Appliance Safety Cert', 5, TRUE),
(9, 4, 'Kitchen Chimney Service', 26, 'EXPERT', 'Ventilation Tech Level 2', 6, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time, is_active) VALUES
(9, 'MONDAY', '08:00:00', '18:00:00', TRUE),
(9, 'TUESDAY', '08:00:00', '18:00:00', TRUE),
(9, 'WEDNESDAY', '08:00:00', '18:00:00', TRUE),
(9, 'THURSDAY', '08:00:00', '18:00:00', TRUE),
(9, 'FRIDAY', '08:00:00', '18:00:00', TRUE),
(9, 'SATURDAY', '09:00:00', '16:00:00', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(9, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(9, '62703', 'Springfield', 'Industrial Parkway & South', TRUE),
(9, '62701', 'Springfield', 'Downtown Capitol District', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(9, 5, TRUE, 'APPROVED', 1, NOW(), 'Lead Specialist for Appliance Repair Team')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);

-- Also add a member to General Maintenance Team: David Miller can have General Maintenance as secondary
INSERT INTO handyman_teams (handyman_id, team_id, is_primary, approval_status, approved_by_user_id, approved_at, notes) VALUES
(2, 7, FALSE, 'APPROVED', 1, NOW(), 'Approved general odd jobs technician')
ON DUPLICATE KEY UPDATE approval_status = VALUES(approval_status);
