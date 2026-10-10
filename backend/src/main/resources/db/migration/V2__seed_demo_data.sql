-- HandyConnect Seed Demonstration Data Migration V2
-- Clearly marked demonstration records for testing and evaluation

-- 1. SEED ROLES
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Platform Administrator with system-wide privileges'),
('ROLE_CUSTOMER', 'Service Consumer capable of booking and managing services'),
('ROLE_HANDYMAN', 'Certified Service Technician performing maintenance jobs'),
('ROLE_INVENTORY_MANAGER', 'Logistics and Warehouse Supervisor managing stock and requisitions'),
('ROLE_SUPPLIER', 'External Supplier fulfilling purchase orders and updating lead times');

-- 2. SEED USERS (Password default for all demo accounts: 'Password123!')
-- BCrypt hash: $2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a
INSERT INTO users (id, email, password_hash, full_name, phone, role, status) VALUES
(1, 'admin@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'System Administrator', '+1-555-0100', 'ROLE_ADMIN', 'ACTIVE'),
(2, 'customer@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'John Doe (Demo Customer)', '+1-555-0201', 'ROLE_CUSTOMER', 'ACTIVE'),
(3, 'handyman1@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Robert Smith (Plumber & Electrician)', '+1-555-0301', 'ROLE_HANDYMAN', 'ACTIVE'),
(4, 'handyman2@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'David Miller (Carpenter & Painter)', '+1-555-0302', 'ROLE_HANDYMAN', 'ACTIVE'),
(5, 'inventory@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Sarah Jenkins (Inventory Manager)', '+1-555-0401', 'ROLE_INVENTORY_MANAGER', 'ACTIVE'),
(6, 'supplier@handyconnect.local', '$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a', 'Apex Supplies Rep', '+1-555-0501', 'ROLE_SUPPLIER', 'ACTIVE');

-- Map user_roles
INSERT INTO user_roles (user_id, role_id) VALUES
(1, 1), -- Admin -> ROLE_ADMIN
(2, 2), -- Customer -> ROLE_CUSTOMER
(3, 3), -- Handyman 1 -> ROLE_HANDYMAN
(4, 3), -- Handyman 2 -> ROLE_HANDYMAN
(5, 4), -- Inventory -> ROLE_INVENTORY_MANAGER
(6, 5); -- Supplier -> ROLE_SUPPLIER

-- 3. PROFILES
INSERT INTO customer_profiles (id, user_id, preferred_contact_method, notes) VALUES
(1, 2, 'PHONE', 'Demonstration Customer Profile. Prefers morning appointments.');

INSERT INTO handyman_profiles (id, user_id, experience_years, bio, service_areas, verification_status, verified_at, verified_by_user_id, hourly_rate, service_radius_km, rating_avg, rating_count) VALUES
(1, 3, 8, 'Licensed Master Plumber & Residential Electrician with 8+ years hands-on experience.', 'Downtown, North Hills, Westside', 'VERIFIED', NOW(), 1, 45.00, 30.00, 4.90, 24),
(2, 4, 5, 'Skilled Carpenter and Fine Finisher specializing in door locks, custom cabinets, and painting.', 'South Valley, Eastgate, Downtown', 'VERIFIED', NOW(), 1, 40.00, 25.00, 4.75, 16);

-- 4. SERVICE CATEGORIES
INSERT INTO service_categories (id, name, code, description, icon_name, is_active, display_order) VALUES
(1, 'Plumbing', 'PLUMB', 'Water pipes, leak repairs, faucets, drain unblocking, and heater installations.', 'Wrench', TRUE, 1),
(2, 'Electrical Repairs', 'ELECT', 'Circuit wiring, breakers, lighting, fans, and safety switchboard installations.', 'Zap', TRUE, 2),
(3, 'Carpentry', 'CARP', 'Door fitting, locks, furniture assembly, shelves, and cabinet restoration.', 'Hammer', TRUE, 3),
(4, 'Appliance Repair', 'APPL', 'Washing machines, dishwashers, refrigerators, and microwave oven fixes.', 'Cpu', TRUE, 4),
(5, 'Painting', 'PAINT', 'Interior wall painting, ceiling coatings, waterproof primers, and trim work.', 'Paintbrush', TRUE, 5),
(6, 'Air Conditioning', 'HVAC', 'AC servicing, filter cleaning, refrigerant top-up, and compressor repair.', 'Wind', TRUE, 6),
(7, 'General Maintenance', 'GENM', 'Drywall patching, grout cleaning, silicone sealing, and minor home adjustments.', 'Tool', TRUE, 7);

-- Handyman Skills
INSERT INTO handyman_skills (handyman_id, category_id, skill_name, certification_details, years_experience) VALUES
(1, 1, 'Pipe Leakage & Soldering', 'City Certified Plumber #PL-4921', 8),
(1, 1, 'Drain Snake & Jetting', 'Drainage Tech Level 2', 6),
(1, 2, 'Domestic Wiring & Circuit Breakers', 'Certified Electrician #EL-8812', 5),
(2, 3, 'Furniture Assembly & Framing', 'Apprentice Carpentry Guild', 5),
(2, 3, 'Locksmith & Deadbolts', 'Locksmith Specialist Cert', 4),
(2, 5, 'Interior Finishing & Roll Painting', 'Professional Finishers Cert', 3);

-- Handyman Availability
INSERT INTO handyman_availability (handyman_id, day_of_week, start_time, end_time, is_active) VALUES
(1, 'MONDAY', '08:00:00', '18:00:00', TRUE),
(1, 'TUESDAY', '08:00:00', '18:00:00', TRUE),
(1, 'WEDNESDAY', '08:00:00', '18:00:00', TRUE),
(1, 'THURSDAY', '08:00:00', '18:00:00', TRUE),
(1, 'FRIDAY', '08:00:00', '18:00:00', TRUE),
(1, 'SATURDAY', '09:00:00', '14:00:00', TRUE),
(2, 'MONDAY', '09:00:00', '17:00:00', TRUE),
(2, 'TUESDAY', '09:00:00', '17:00:00', TRUE),
(2, 'WEDNESDAY', '09:00:00', '17:00:00', TRUE),
(2, 'THURSDAY', '09:00:00', '17:00:00', TRUE),
(2, 'FRIDAY', '09:00:00', '17:00:00', TRUE);

-- Customer Addresses
INSERT INTO addresses (id, user_id, label, street_line, city, state, postal_code, latitude, longitude, is_default) VALUES
(1, 2, 'Home', '742 Evergreen Terrace', 'Springfield', 'Metro State', '62704', 39.781721, -89.650148, TRUE),
(2, 2, 'Office', '100 Industrial Parkway, Suite 4B', 'Springfield', 'Metro State', '62703', 39.775100, -89.640200, FALSE);

-- 5. INVENTORY LOCATIONS
INSERT INTO inventory_locations (id, code, name, address, latitude, longitude, is_active) VALUES
(1, 'LOC-CENTRAL', 'Central City Warehouse', '10 Warehouse Way, Downtown', 39.780000, -89.650000, TRUE),
(2, 'LOC-NORTH', 'North Suburban Hub', '450 North Ridge Rd, North Hills', 39.810000, -89.645000, TRUE),
(3, 'LOC-SOUTH', 'South Metro Depot', '890 Industrial Blvd, South Valley', 39.750000, -89.655000, TRUE);

-- 6. INVENTORY ITEMS (Spare parts and materials)
INSERT INTO inventory_items (id, sku, name, description, category, unit_of_measure, cost_price, selling_price, reorder_level, safety_stock, is_active) VALUES
(1, 'PLUMB-PEX-01', 'PEX Pipe 1/2-inch (10ft)', 'Flexible high-density cross-linked polyethylene pipe for hot and cold plumbing', 'Plumbing', 'PCS', 8.50, 14.00, 20.00, 10.00, TRUE),
(2, 'PLUMB-FIT-02', 'Brass Push-Fit Coupling 1/2-inch', 'Lead-free brass push-to-connect fitting for copper, PEX, and CPVC', 'Plumbing', 'PCS', 5.20, 9.50, 30.00, 15.00, TRUE),
(3, 'PLUMB-TEF-03', 'PTFE Thread Seal Tape (Teflon)', 'High density PTFE thread sealant tape 1/2 in x 520 in', 'Plumbing', 'ROLL', 1.10, 2.50, 50.00, 20.00, TRUE),
(4, 'ELECT-WIRE-01', 'Copper Wire 2.5mm² (50m Coil)', 'Flame retardant PVC insulated copper conductor electrical cable', 'Electrical', 'COIL', 32.00, 55.00, 15.00, 5.00, TRUE),
(5, 'ELECT-MCB-02', 'Miniature Circuit Breaker (MCB 16A)', 'Single pole C-curve DIN rail mounted circuit breaker', 'Electrical', 'PCS', 7.80, 14.50, 25.00, 10.00, TRUE),
(6, 'CARP-HINGE-01', 'Heavy Duty Soft-Close Cabinet Hinge', 'Concealed kitchen cabinet nickel-plated European hinge pair', 'Carpentry', 'PAIR', 4.50, 8.50, 40.00, 15.00, TRUE),
(7, 'CARP-LOCK-02', 'Security Deadbolt Lockset Brass', 'Single cylinder exterior door deadbolt with anti-pick pins', 'Carpentry', 'SET', 18.00, 32.00, 15.00, 5.00, TRUE),
(8, 'PAINT-PRIME-01', 'Anti-Damp Primer Paint (4 Liters)', 'Acrylic stain-blocking waterproofing undercoat primer', 'Painting', 'CAN', 22.00, 38.00, 10.00, 4.00, TRUE),
(9, 'HVAC-GAS-01', 'R32 Refrigerant Gas Cylinder (3kg)', 'Eco-friendly high efficiency air conditioner refrigerant gas canister', 'HVAC', 'CYL', 45.00, 85.00, 8.00, 3.00, TRUE),
(10, 'GEN-SCREW-01', 'Multi-Purpose Drywall Screws Box (100pcs)', 'Zinc plated phillips head bugle point wood and drywall anchor screws', 'General', 'BOX', 3.00, 6.00, 50.00, 20.00, TRUE);

-- Inventory Balances across locations
INSERT INTO inventory_balances (item_id, location_id, quantity_on_hand, reserved_quantity) VALUES
-- LOC-CENTRAL (Main stock)
(1, 1, 45.00, 0.00),
(2, 1, 60.00, 0.00),
(3, 1, 100.00, 0.00),
(4, 1, 20.00, 0.00),
(5, 1, 35.00, 0.00),
(6, 1, 50.00, 0.00),
(7, 1, 18.00, 0.00),
(8, 1, 15.00, 0.00),
(9, 1, 12.00, 0.00),
(10, 1, 80.00, 0.00),
-- LOC-NORTH (Suburban Hub)
(1, 2, 10.00, 0.00),
(2, 2, 15.00, 0.00),
(3, 2, 25.00, 0.00),
(4, 2, 5.00, 0.00),
(5, 2, 8.00, 0.00),
-- LOC-SOUTH (South Metro Depot)
(1, 3, 5.00, 0.00),
(2, 3, 8.00, 0.00),
(6, 3, 12.00, 0.00),
(7, 3, 6.00, 0.00);

-- Initial Goods Receipt Movement Log
INSERT INTO inventory_movements (item_id, location_id, movement_type, quantity, balance_after, reference_type, reference_id, reason, performed_by_user_id) VALUES
(1, 1, 'GOODS_RECEIPT', 45.00, 45.00, 'INITIAL_SEED', 'SEED-001', 'Initial stock intake for system launch', 1),
(2, 1, 'GOODS_RECEIPT', 60.00, 60.00, 'INITIAL_SEED', 'SEED-001', 'Initial stock intake for system launch', 1),
(3, 1, 'GOODS_RECEIPT', 100.00, 100.00, 'INITIAL_SEED', 'SEED-001', 'Initial stock intake for system launch', 1);

-- 7. SERVICES
INSERT INTO services (id, category_id, name, code, description, indicative_base_price, estimated_duration_minutes, required_skills, is_active) VALUES
(1, 1, 'Pipe Leak Detection and Repair', 'SRV-PLUMB-LEAK', 'Inspection of leaking supply/drain pipes, replacement of damaged section with brass couplings and PEX pipe.', 65.00, 90, 'Pipe Leakage & Soldering, Drainage Tech', TRUE),
(2, 1, 'Kitchen Faucet Replacement', 'SRV-PLUMB-FAUCET', 'Removal of old kitchen mixer tap, pipe flushing, new faucet installation, and leak check.', 50.00, 60, 'Pipe Leakage & Soldering', TRUE),
(3, 2, 'Circuit Breaker Tripping Diagnostic', 'SRV-ELECT-MCB', 'Diagnostic troubleshooting of short circuits, insulation test, and single-pole MCB replacement.', 70.00, 75, 'Domestic Wiring & Circuit Breakers', TRUE),
(4, 2, 'Ceiling Fan Installation & Wiring', 'SRV-ELECT-FAN', 'Secure ceiling bracket anchor, motor assembly, wire connection to wall regulator, and balance calibration.', 45.00, 60, 'Domestic Wiring & Circuit Breakers', TRUE),
(5, 3, 'Security Deadbolt Installation', 'SRV-CARP-LOCK', 'Chiseling door borehole, faceplate mortising, deadbolt latch installation, and key alignment check.', 55.00, 60, 'Locksmith & Deadbolts', TRUE),
(6, 3, 'Kitchen Cabinet Hinge Realignment & Replacement', 'SRV-CARP-HINGE', 'Installation of soft-close concealed hinges, sag adjustment, and gap leveling across cabinet doors.', 40.00, 45, 'Furniture Assembly & Framing', TRUE),
(7, 5, 'Single Room Waterproof Wall Painting', 'SRV-PAINT-ROOM', 'Wall surface sanding, crack filling, primer undercoat application, and two coats of washable emulsion paint.', 120.00, 180, 'Interior Finishing & Roll Painting', TRUE),
(8, 6, 'AC Diagnostic & Refrigerant Top-Up', 'SRV-HVAC-REFILL', 'Comprehensive pressure manifold gauge testing, coil cleaning, and precise R32 refrigerant recharging.', 85.00, 90, 'HVAC Certified Spares', TRUE);

-- Standard Material Requirements for Services
INSERT INTO service_materials (service_id, item_id, standard_quantity, is_mandatory, notes) VALUES
(1, 1, 1.00, TRUE, '10ft PEX Pipe standard cut'),
(1, 2, 2.00, TRUE, 'Push-fit brass couplings'),
(1, 3, 1.00, TRUE, 'PTFE Teflon tape roll'),
(2, 3, 1.00, TRUE, 'PTFE thread seal tape for thread joins'),
(3, 5, 1.00, TRUE, '16A miniature circuit breaker replacement'),
(5, 7, 1.00, TRUE, 'Brass deadbolt lockset'),
(6, 6, 2.00, TRUE, '2 pairs soft-close concealed cabinet hinges');

-- 8. SUPPLIERS
INSERT INTO suppliers (id, code, company_name, contact_person, email, phone, address, lead_time_days, is_active) VALUES
(1, 'SUP-APEX', 'Apex Industrial Supplies Ltd', 'Arthur Pendelton', 'sales@apexsupplies.com', '+1-555-9011', '800 Industrial Highway, Logistics Park', 2, TRUE),
(2, 'SUP-METRO', 'Metro Electric & Hardware Wholesale', 'Elena Rostova', 'orders@metroelectric.com', '+1-555-9022', '310 Voltage Ave, Tech District', 3, TRUE),
(3, 'SUP-COOL', 'CoolAir HVAC Spares Inc', 'Marcus Vance', 'dispatch@coolairspares.com', '+1-555-9033', '120 Frigid Way, Freezepoint', 4, TRUE);

INSERT INTO supplier_items (supplier_id, item_id, supplier_sku, wholesale_price, standard_lead_time_days, min_order_quantity) VALUES
(1, 1, 'APX-PEX-10', 7.20, 2, 10.00),
(1, 2, 'APX-FIT-12', 4.30, 2, 20.00),
(1, 3, 'APX-TEF-01', 0.85, 1, 50.00),
(2, 4, 'MTR-WIR-25', 28.50, 3, 5.00),
(2, 5, 'MTR-MCB-16', 6.50, 3, 10.00),
(3, 9, 'COL-GAS-R32', 38.00, 4, 4.00);

-- 9. INITIAL SAMPLE BOOKING TO DEMONSTRATE COMPLETE ENGINE WORKFLOW
INSERT INTO bookings (id, booking_reference, customer_id, service_id, address_id, status, scheduled_date, scheduled_time_slot, problem_description, quotation_amount, materials_amount, final_amount, job_readiness_status, readiness_notes) VALUES
(1, 'BK-20261010-001', 2, 1, 1, 'PENDING', DATE_ADD(CURRENT_DATE, INTERVAL 1 DAY), '09:00 - 11:00', 'Kitchen under-sink pipe is dripping heavily whenever the main valve is open.', 98.00, 33.00, 98.00, 'READY', 'Handyman Robert Smith matches skills and Central Warehouse has PEX pipe & brass couplings in stock.');
