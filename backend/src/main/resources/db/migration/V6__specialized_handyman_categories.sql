-- HandyConnect Migration V6: Specialized Handyman Categories and Smart Job Assignment

-- 1. Standardize the 6 Core Specialized Service Categories
UPDATE service_categories 
SET name = 'Plumbing Works', 
    code = 'PLUMB', 
    description = 'Licensed plumbers for pipe leakage, blockage repairs, tap, sink, toilet fixtures, and water-pump installations.', 
    icon_name = 'Wrench', 
    display_order = 1,
    is_active = TRUE
WHERE id = 1;

UPDATE service_categories 
SET name = 'Electrical Works', 
    code = 'ELECT', 
    description = 'Licensed wiremen for domestic wiring, switches, sockets, ceiling fans, breakers, and electrical fault diagnostics.', 
    icon_name = 'Zap', 
    display_order = 2,
    is_active = TRUE
WHERE id = 2;

UPDATE service_categories 
SET name = 'Carpentry Works', 
    code = 'CARP', 
    description = 'Master joiners for door and lock repairs, furniture assembly, shelving, and precision cabinetry installation.', 
    icon_name = 'Hammer', 
    display_order = 3,
    is_active = TRUE
WHERE id = 3;

UPDATE service_categories 
SET name = 'HVAC and Appliance Repair', 
    code = 'HVAC_APPL', 
    description = 'Climate specialists and major appliance technicians for AC servicing, refrigerators, washing machines, and cooling maintenance.', 
    icon_name = 'Wind', 
    display_order = 4,
    is_active = TRUE
WHERE id = 4;

UPDATE service_categories 
SET name = 'Painting and Civil Repairs', 
    code = 'PAINT_CIVIL', 
    description = 'Professional painters for wall cracks, plaster repairs, interior coatings, waterproofing, and minor masonry repairs.', 
    icon_name = 'Paintbrush', 
    display_order = 5,
    is_active = TRUE
WHERE id = 5;

-- Remap old Category 6 (Air Conditioning) to Category 4 (HVAC and Appliance Repair)
UPDATE services SET category_id = 4 WHERE category_id = 6;
UPDATE handyman_skills SET category_id = 4 WHERE category_id = 6;
UPDATE service_categories SET is_active = FALSE WHERE id = 6;

-- Category 7 as General Handyman Services
UPDATE service_categories 
SET name = 'General Handyman Services', 
    code = 'GEN_HANDY', 
    description = 'Multi-skilled technicians for general maintenance, minor household repairs, mounting, and basic installations.', 
    icon_name = 'Tool', 
    display_order = 6,
    is_active = TRUE
WHERE id = 7;

-- 2. Link services to service teams where needed
UPDATE services SET team_id = 1 WHERE category_id = 2 AND team_id IS NULL; -- Electrical
UPDATE services SET team_id = 3 WHERE category_id = 1 AND team_id IS NULL; -- Plumbing
UPDATE services SET team_id = 4 WHERE category_id = 3 AND team_id IS NULL; -- Carpentry
UPDATE services SET team_id = 2 WHERE category_id = 4 AND (code LIKE '%HVAC%' OR name LIKE '%AC%') AND team_id IS NULL; -- HVAC
UPDATE services SET team_id = 5 WHERE category_id = 4 AND team_id IS NULL; -- Appliance
UPDATE services SET team_id = 6 WHERE category_id = 5 AND team_id IS NULL; -- Painting
UPDATE services SET team_id = 7 WHERE category_id = 7 AND team_id IS NULL; -- General
