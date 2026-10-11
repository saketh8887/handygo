-- HandyConnect Migration V4: Skill-Based Specialization, Service Skill Requirements, and Intelligent Assignment Schema

-- 1. SPECIALIZATIONS
CREATE TABLE IF NOT EXISTS specializations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    icon_name VARCHAR(50) DEFAULT 'Wrench',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. SKILLS
CREATE TABLE IF NOT EXISTS skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    specialization_id BIGINT NOT NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_skill_spec FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE,
    INDEX idx_skill_spec (specialization_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. HANDYMAN SPECIALIZATIONS (Many-to-Many with primary flag)
CREATE TABLE IF NOT EXISTS handyman_specializations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    handyman_id BIGINT NOT NULL,
    specialization_id BIGINT NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    years_experience INT DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hs_handyman FOREIGN KEY (handyman_id) REFERENCES handyman_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_hs_spec FOREIGN KEY (specialization_id) REFERENCES specializations(id) ON DELETE CASCADE,
    CONSTRAINT uq_handyman_spec UNIQUE (handyman_id, specialization_id),
    INDEX idx_hs_handyman (handyman_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. SERVICE REQUIRED SKILLS (Many-to-Many linking services to skills)
CREATE TABLE IF NOT EXISTS service_required_skills (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    service_id BIGINT NOT NULL,
    skill_id BIGINT NOT NULL,
    is_mandatory BOOLEAN NOT NULL DEFAULT TRUE,
    min_proficiency VARCHAR(30) DEFAULT 'INTERMEDIATE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_srs_service FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    CONSTRAINT fk_srs_skill FOREIGN KEY (skill_id) REFERENCES skills(id) ON DELETE CASCADE,
    CONSTRAINT uq_service_skill UNIQUE (service_id, skill_id),
    INDEX idx_srs_service (service_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. HANDYMAN CERTIFICATIONS & QUALIFICATIONS
CREATE TABLE IF NOT EXISTS handyman_certifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    handyman_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    issuing_organization VARCHAR(150),
    certificate_number VARCHAR(100),
    issue_date DATE,
    expiry_date DATE,
    verification_status VARCHAR(30) NOT NULL DEFAULT 'PENDING', -- PENDING, VERIFIED, REJECTED
    verification_notes TEXT,
    verified_at TIMESTAMP NULL,
    verified_by_user_id BIGINT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hcert_handyman FOREIGN KEY (handyman_id) REFERENCES handyman_profiles(id) ON DELETE CASCADE,
    CONSTRAINT fk_hcert_verified_by FOREIGN KEY (verified_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_hcert_handyman (handyman_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. HANDYMAN SERVICE AREAS
CREATE TABLE IF NOT EXISTS handyman_service_areas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    handyman_id BIGINT NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    city VARCHAR(100),
    area_name VARCHAR(100),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_hsa_handyman FOREIGN KEY (handyman_id) REFERENCES handyman_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uq_handyman_area UNIQUE (handyman_id, postal_code),
    INDEX idx_hsa_handyman (handyman_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. EXTEND HANDYMAN PROFILES TABLE
ALTER TABLE handyman_profiles
    ADD COLUMN profile_photo_url VARCHAR(500) NULL,
    ADD COLUMN max_active_workload INT NOT NULL DEFAULT 3,
    ADD COLUMN availability_status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    ADD COLUMN completed_job_count INT NOT NULL DEFAULT 0;

-- 8. EXTEND HANDYMAN SKILLS TABLE (link to skills catalog)
ALTER TABLE handyman_skills
    ADD COLUMN skill_id BIGINT NULL,
    ADD COLUMN proficiency_level VARCHAR(30) DEFAULT 'INTERMEDIATE',
    ADD COLUMN is_verified BOOLEAN DEFAULT TRUE;

-- 9. SEED CORE SPECIALIZATIONS
INSERT INTO specializations (id, name, code, description, icon_name, is_active) VALUES
(1, 'Plumbing Systems', 'PLUMBING', 'Water supply, drainage, leak detection, pipe fitting, sanitary fixtures', 'Wrench', TRUE),
(2, 'Electrical Systems', 'ELECTRICAL', 'Power distribution, switchboards, wiring, fixtures, breaker diagnostics', 'Zap', TRUE),
(3, 'Carpentry & Joinery', 'CARPENTRY', 'Door locks, deadbolts, cabinet making, furniture assembly, timber repair', 'Hammer', TRUE),
(4, 'HVAC & Climate Control', 'HVAC', 'Air conditioner maintenance, refrigerant diagnostics, compressor repairs', 'Wind', TRUE),
(5, 'Appliance Repair', 'APPLIANCE', 'Major home appliances, motors, pumps, dishwashers, washing machines', 'Cpu', TRUE),
(6, 'Painting & Surface Finishing', 'PAINTING', 'Interior & exterior coatings, waterproofing, drywall prep, trim finish', 'Paintbrush', TRUE),
(7, 'General Handyman Maintenance', 'GENERAL', 'Multidisciplinary patching, grouting, caulking, minor home repairs', 'Tool', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 10. SEED CORE SKILLS
INSERT INTO skills (id, specialization_id, name, code, description, is_active) VALUES
-- Plumbing (spec 1)
(1, 1, 'Pipe Leakage & Soldering', 'SKILL_PLUMB_LEAK', 'Copper, PEX, and PVC pipe leak diagnostic, replacement, and joint soldering', TRUE),
(2, 1, 'Drain Unblocking & Jetting', 'SKILL_PLUMB_DRAIN', 'Mechanical auger snaking, drain line clearing, trap unclogging', TRUE),
(3, 1, 'Faucet & Fixture Replacement', 'SKILL_PLUMB_FAUCET', 'Kitchen and bathroom faucet install, valve seating, and pressure testing', TRUE),
-- Electrical (spec 2)
(4, 2, 'Domestic Wiring & Circuit Breakers', 'SKILL_ELECT_WIRING', 'Circuit breaker replacement, fuse box diagnostics, neutral load balancing', TRUE),
(5, 2, 'Ceiling Fan & Fixture Installation', 'SKILL_ELECT_FIXTURE', 'High-ceiling fan brackets, dimmer switches, light fittings', TRUE),
(6, 2, 'Electrical Troubleshooting & Safety', 'SKILL_ELECT_SAFETY', 'Earth leakage circuit breaker testing, insulation test, short finding', TRUE),
-- Carpentry (spec 3)
(7, 3, 'Locksmithing & Security Deadbolts', 'SKILL_CARP_LOCK', 'High-security cylinder deadbolt installation, door mortising, latch alignment', TRUE),
(8, 3, 'Furniture & Cabinet Assembly', 'SKILL_CARP_CABINET', 'Concealed hinge replacement, flat-pack assembly, cabinet sag leveling', TRUE),
-- HVAC (spec 4)
(9, 4, 'AC Diagnostics & Refrigerant Servicing', 'SKILL_HVAC_REFRIG', 'Manifold gauge pressure reading, R32/R410A refrigerant recharge, leak check', TRUE),
(10, 4, 'Air Conditioner Coil & Filter Maintenance', 'SKILL_HVAC_COIL', 'Chemical evaporator cleaning, condensate pan flushing, airflow calibration', TRUE),
-- Painting (spec 6)
(11, 6, 'Interior Finishing & Roll Painting', 'SKILL_PAINT_INTERIOR', 'Surface prep, tape masking, primer application, roller/brush coat finish', TRUE),
(12, 6, 'Waterproof Primer Application', 'SKILL_PAINT_WATERPROOF', 'Anti-damp elastomeric waterproofing, moisture barrier priming', TRUE),
-- General (spec 7)
(13, 7, 'Drywall & Plaster Repair', 'SKILL_GEN_DRYWALL', 'Hole patching, drywall tape, joint compound feathering, sanding', TRUE)
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- 11. MAP SERVICES TO REQUIRED SKILLS
-- Service 1: Pipe Leak Detection and Repair (Requires Pipe Leakage & Soldering + Drain)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(1, 1, TRUE, 'INTERMEDIATE')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- Service 2: Kitchen Faucet Replacement (Requires Faucet & Fixture Replacement + Pipe Leakage)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(2, 3, TRUE, 'INTERMEDIATE')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- Service 3: Circuit Breaker Tripping Diagnostic (Requires Domestic Wiring & Circuit Breakers + Safety)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(3, 4, TRUE, 'EXPERT'),
(3, 6, TRUE, 'INTERMEDIATE')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- Service 4: Ceiling Fan Installation & Wiring (Requires Ceiling Fan & Fixture Installation + Domestic Wiring)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(4, 5, TRUE, 'INTERMEDIATE'),
(4, 4, TRUE, 'INTERMEDIATE')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- Service 5: Security Deadbolt Installation (Requires Locksmithing & Security Deadbolts)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(5, 7, TRUE, 'INTERMEDIATE')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- Service 6: Kitchen Cabinet Hinge Realignment & Replacement (Requires Furniture & Cabinet Assembly)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(6, 8, TRUE, 'INTERMEDIATE')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- Service 7: Single Room Waterproof Wall Painting (Requires Interior Finishing + Waterproof Primer)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(7, 11, TRUE, 'INTERMEDIATE'),
(7, 12, TRUE, 'INTERMEDIATE')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- Service 8: AC Diagnostic & Refrigerant Top-Up (Requires AC Diagnostics & Refrigerant Servicing)
INSERT INTO service_required_skills (service_id, skill_id, is_mandatory, min_proficiency) VALUES
(8, 9, TRUE, 'EXPERT')
ON DUPLICATE KEY UPDATE is_mandatory = VALUES(is_mandatory);

-- 12. SEED HANDYMAN 1 (Robert Smith - Plumber & Electrician)
-- Specializations
INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(1, 1, TRUE, 8),   -- Primary: Plumbing (8 yrs)
(1, 2, FALSE, 5)   -- Secondary: Electrical (5 yrs)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

-- Link Skills
UPDATE handyman_skills SET skill_id = 1, proficiency_level = 'EXPERT' WHERE handyman_id = 1 AND skill_name LIKE '%Leakage%';
UPDATE handyman_skills SET skill_id = 2, proficiency_level = 'INTERMEDIATE' WHERE handyman_id = 1 AND skill_name LIKE '%Drain%';
UPDATE handyman_skills SET skill_id = 4, proficiency_level = 'EXPERT' WHERE handyman_id = 1 AND skill_name LIKE '%Wiring%';
-- Add extra skills for handyman 1
INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(1, 1, 'Faucet & Fixture Replacement', 3, 'EXPERT', 'City Certified Plumber #PL-4921', 8, TRUE),
(1, 2, 'Ceiling Fan & Fixture Installation', 5, 'INTERMEDIATE', 'Certified Electrician #EL-8812', 5, TRUE),
(1, 2, 'Electrical Troubleshooting & Safety', 6, 'EXPERT', 'Certified Electrician #EL-8812', 5, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

-- Certifications for Handyman 1
INSERT INTO handyman_certifications (handyman_id, title, issuing_organization, certificate_number, issue_date, expiry_date, verification_status, verified_at, verified_by_user_id) VALUES
(1, 'Master Plumber State License', 'Department of Professional Regulation', 'MPL-90421', '2019-03-15', '2027-03-15', 'VERIFIED', NOW(), 1),
(1, 'Residential Electrical Contractor Certification', 'National Electrical Contractors Association', 'REC-44102', '2021-06-10', '2028-06-10', 'VERIFIED', NOW(), 1)
ON DUPLICATE KEY UPDATE verification_status = VALUES(verification_status);

-- Service Areas for Handyman 1 (covers 62704, 62703, 62701)
INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(1, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(1, '62703', 'Springfield', 'Industrial Parkway & South', TRUE),
(1, '62701', 'Springfield', 'Downtown Capitol District', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Update Handyman 1 workload and stats
UPDATE handyman_profiles SET
    max_active_workload = 4,
    availability_status = 'AVAILABLE',
    completed_job_count = 24
WHERE id = 1;

-- 13. SEED HANDYMAN 2 (David Miller - Carpenter & Painter)
-- Specializations
INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(2, 3, TRUE, 5),   -- Primary: Carpentry (5 yrs)
(2, 6, FALSE, 3)   -- Secondary: Painting (3 yrs)
ON DUPLICATE KEY UPDATE is_primary = VALUES(is_primary);

-- Link Skills
UPDATE handyman_skills SET skill_id = 8, proficiency_level = 'EXPERT' WHERE handyman_id = 2 AND skill_name LIKE '%Furniture%';
UPDATE handyman_skills SET skill_id = 7, proficiency_level = 'EXPERT' WHERE handyman_id = 2 AND skill_name LIKE '%Locksmith%';
UPDATE handyman_skills SET skill_id = 11, proficiency_level = 'INTERMEDIATE' WHERE handyman_id = 2 AND skill_name LIKE '%Finishing%';
-- Add extra skill for Handyman 2
INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(2, 5, 'Waterproof Primer Application', 12, 'INTERMEDIATE', 'Professional Finishers Cert', 3, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

-- Certifications for Handyman 2
INSERT INTO handyman_certifications (handyman_id, title, issuing_organization, certificate_number, issue_date, expiry_date, verification_status, verified_at, verified_by_user_id) VALUES
(2, 'Master Woodworker & Architectural Joinery', 'National Guild of Carpenters', 'NGC-77194', '2020-04-20', '2028-04-20', 'VERIFIED', NOW(), 1),
(2, 'Architectural Coatings & Paint Specialist', 'Society of Protective Coatings', 'SSPC-3318', '2022-01-15', '2029-01-15', 'VERIFIED', NOW(), 1)
ON DUPLICATE KEY UPDATE verification_status = VALUES(verification_status);

-- Service Areas for Handyman 2 (covers 62704, 62702, 62705)
INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(2, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(2, '62702', 'Springfield', 'North Grand & Ridge', TRUE),
(2, '62705', 'Springfield', 'Eastgate Estates', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Update Handyman 2 workload and stats
UPDATE handyman_profiles SET
    max_active_workload = 3,
    availability_status = 'AVAILABLE',
    completed_job_count = 16
WHERE id = 2;

-- 14. SEED HANDYMAN 3 (Carlos Reyes - HVAC Specialist)
-- User
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(7, 'handyman3@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Carlos Reyes (HVAC Technician)', '+1-555-0303', 'ROLE_HANDYMAN', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES (7, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

-- Handyman Profile 3
INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, verified_at, verified_by_user_id, hourly_rate, service_radius_km, rating_avg, rating_count, max_active_workload, availability_status, completed_job_count) VALUES
(3, 7, 6, 'EPA Certified Universal HVAC technician specializing in split systems, refrigerant leak detection, and compressor repair.', 'Springfield Metro, Downtown, North Hills', 'VERIFIED', NOW(), 1, 55.00, 35.00, 4.88, 19, 3, 'AVAILABLE', 19)
ON DUPLICATE KEY UPDATE verification_status = 'VERIFIED';

-- Specialization for Handyman 3
INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(3, 4, TRUE, 6)   -- Primary: HVAC (6 yrs)
ON DUPLICATE KEY UPDATE is_primary = TRUE;

-- Skills for Handyman 3
INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(3, 6, 'AC Diagnostics & Refrigerant Servicing', 9, 'EXPERT', 'EPA Universal 608 #HVAC-9902', 6, TRUE),
(3, 6, 'Air Conditioner Coil & Filter Maintenance', 10, 'EXPERT', 'EPA Universal 608 #HVAC-9902', 6, TRUE)
ON DUPLICATE KEY UPDATE is_verified = TRUE;

-- Availability for Handyman 3
INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time, is_active) VALUES
(3, 'MONDAY', '08:00:00', '18:00:00', TRUE),
(3, 'TUESDAY', '08:00:00', '18:00:00', TRUE),
(3, 'WEDNESDAY', '08:00:00', '18:00:00', TRUE),
(3, 'THURSDAY', '08:00:00', '18:00:00', TRUE),
(3, 'FRIDAY', '08:00:00', '18:00:00', TRUE),
(3, 'SATURDAY', '09:00:00', '15:00:00', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- Certifications for Handyman 3
INSERT INTO handyman_certifications (handyman_id, title, issuing_organization, certificate_number, issue_date, expiry_date, verification_status, verified_at, verified_by_user_id) VALUES
(3, 'EPA Section 608 Universal HVAC Technician', 'Environmental Protection Agency', 'EPA-608-882194', '2020-08-14', '2028-08-14', 'VERIFIED', NOW(), 1)
ON DUPLICATE KEY UPDATE verification_status = 'VERIFIED';

-- Service Areas for Handyman 3
INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(3, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE),
(3, '62703', 'Springfield', 'Industrial Parkway & South', TRUE),
(3, '62701', 'Springfield', 'Downtown Capitol District', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;

-- 15. SEED HANDYMAN 4 (Unverified Technician - for testing verification gate)
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(8, 'handyman4@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Marcus Cole (Pending Review)', '+1-555-0304', 'ROLE_HANDYMAN', 'ACTIVE')
ON DUPLICATE KEY UPDATE full_name = VALUES(full_name);

INSERT INTO user_roles (user_id, role_id) VALUES (8, 3)
ON DUPLICATE KEY UPDATE role_id = VALUES(role_id);

INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, hourly_rate, service_radius_km, rating_avg, rating_count, max_active_workload, availability_status, completed_job_count) VALUES
(4, 8, 2, 'Entry level plumber pending credential verification.', 'Downtown', 'PENDING', 30.00, 20.00, 5.00, 0, 2, 'AVAILABLE', 0)
ON DUPLICATE KEY UPDATE verification_status = 'PENDING';

INSERT INTO handyman_specializations (handyman_id, specialization_id, is_primary, years_experience) VALUES
(4, 1, TRUE, 2)
ON DUPLICATE KEY UPDATE is_primary = TRUE;

INSERT INTO handyman_skills (handyman_id, category_id, skill_name, skill_id, proficiency_level, certification_details, years_experience, is_verified) VALUES
(4, 1, 'Pipe Leakage & Soldering', 1, 'BEGINNER', 'Pending verification', 2, FALSE)
ON DUPLICATE KEY UPDATE is_verified = FALSE;

INSERT INTO handyman_service_areas (handyman_id, postal_code, city, area_name, is_active) VALUES
(4, '62704', 'Springfield', 'West Springfield & Evergreen', TRUE)
ON DUPLICATE KEY UPDATE is_active = TRUE;
