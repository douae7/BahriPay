-- ==============================================================================
-- Bahripay Maritime & Fishing Management - Initial Reference & Seed Data
-- ==============================================================================

INSERT IGNORE INTO roles (id, name, description) VALUES
(1, 'ADMIN', 'Administrateur système complet'),
(2, 'ARMATEUR', 'Armateur / Direction complète flotte, marins et finances'),
(3, 'CAPITAINE', 'Capitaine de navire : sorties de pêche, captures et équipages'),
(4, 'FINANCIER', 'Gestionnaire financier : ventes, dépenses et fiches de paiement'),
(5, 'OBSERVATEUR', 'Audit et consultation des rapports'),
(6, 'USER', 'Utilisateur maritime standard');

INSERT IGNORE INTO grades (id, code, label, default_share_weight, description) VALUES
(1, 'CAPITAINE', 'Capitaine', 2.00, 'Patron de pêche commandant le navire'),
(2, 'SECOND', 'Second', 1.50, 'Second capitaine responsable des manœuvres'),
(3, 'MECANICIEN', 'Mécanicien', 1.50, 'Chef mécanicien moteur et treuils'),
(4, 'MATELOT', 'Matelot', 1.00, 'Matelot pont qualifié'),
(5, 'MOUSSE', 'Mousse', 0.75, 'Apprenti marin embarqué');

INSERT IGNORE INTO especes_poisson (id, code, name, scientific_name, default_price_per_kg, category) VALUES
(1, 'BAR', 'Bar de ligne', 'Dicentrarchus labrax', 18.50, 'Poisson noble'),
(2, 'DOR', 'Dorade royale', 'Sparus aurata', 13.50, 'Poisson côtier'),
(3, 'THN', 'Thon rouge', 'Thunnus thynnus', 16.00, 'Pélagique hauturier'),
(4, 'MRL', 'Merlu blanc', 'Merluccius merluccius', 7.60, 'Poisson de fond'),
(5, 'LNG', 'Langoustine', 'Nephrops norvegicus', 24.00, 'Crustacé'),
(6, 'SRD', 'Sardine', 'Sardina pilchardus', 3.40, 'Petit pélagique'),
(7, 'MAQ', 'Maquereau', 'Scomber scombrus', 4.20, 'Petit pélagique'),
(8, 'SOL', 'Sole commune', 'Solea solea', 21.00, 'Poisson plat noble');

INSERT IGNORE INTO regles_repartition (id, rule_name, boat_share_percent, crew_share_percent, deduct_common_expenses_before_split, active, updated_at, updated_by_email) VALUES
(1, 'Convention Armement Atlantique 45/55', 45.00, 55.00, 1, 1, NOW(), 'direction@bahripay-armement.fr');

INSERT IGNORE INTO bateaux (id, name, registration, vessel_type, capacity_kg, engine_power_hp, length_meters, home_port, status, last_maintenance_date, image_url) VALUES
(1, 'L’Étoile du Ponant', 'CC 924510', 'Chalutier hauturier', 18500, 680, 22.40, 'Concarneau', 'DISPONIBLE', '2026-10-14', '/src/assets/images/vessel_trawler_hero_1795370246302.jpg'),
(2, 'Brise d’Armor', 'LO 841203', 'Fileyeur côtier', 9200, 420, 16.80, 'Lorient', 'EN_MER', '2026-11-02', '/src/assets/images/maritime_port_ops_1795370246156.jpg'),
(3, 'Cap Méridien', 'ST 715890', 'Thonier senneur', 26000, 920, 28.50, 'Sète', 'DISPONIBLE', '2026-09-28', '/src/assets/images/vessel_trawler_hero_1795370246302.jpg'),
(4, 'Alizé Atlantique', 'LR 603418', 'Caseyeur polyvalent', 7500, 350, 14.90, 'La Rochelle', 'EN_MAINTENANCE', '2026-11-18', '/src/assets/images/maritime_port_ops_1795370246156.jpg');

INSERT IGNORE INTO marins (id, registration_number, first_name, last_name, phone, email, grade_id, share_weight, status, port_attache, years_experience, bateau_id) VALUES
(1, 'ENIM-449821', 'Yannick', 'Keravec', '+33 6 42 18 90 11', 'y.keravec@bahripay.fr', 1, 2.00, 'ACTIF', 'Concarneau', 17, 1),
(2, 'ENIM-512034', 'Erwan', 'Tanguy', '+33 6 77 34 12 45', 'e.tanguy@bahripay.fr', 1, 2.00, 'EN_MER', 'Lorient', 12, 2),
(3, 'ENIM-389102', 'Karim', 'Benali', '+33 6 19 88 45 20', 'k.benali@bahripay.fr', 1, 2.00, 'ACTIF', 'Sète', 19, 3),
(4, 'ENIM-604412', 'Loïc', 'Guégan', '+33 6 58 21 09 73', 'l.guegan@bahripay.fr', 3, 1.50, 'ACTIF', 'Concarneau', 9, 1),
(5, 'ENIM-718923', 'Mathieu', 'Roux', '+33 6 33 74 51 88', 'm.roux@bahripay.fr', 2, 1.50, 'ACTIF', 'Concarneau', 7, 1),
(6, 'ENIM-690211', 'Thibault', 'Mercier', '+33 6 82 14 67 02', 't.mercier@bahripay.fr', 2, 1.50, 'EN_CONGE', 'La Rochelle', 6, 4),
(7, 'ENIM-842190', 'Nolan', 'Le Goff', '+33 6 95 04 33 61', 'n.legoff@bahripay.fr', 4, 1.00, 'EN_MER', 'Lorient', 4, 2),
(8, 'ENIM-905314', 'Sofiane', 'Amrani', '+33 6 11 52 94 37', 's.amrani@bahripay.fr', 4, 1.00, 'ACTIF', 'Sète', 3, 3);

UPDATE bateaux SET captain_id = 1 WHERE id = 1 AND captain_id IS NULL;
UPDATE bateaux SET captain_id = 2 WHERE id = 2 AND captain_id IS NULL;
UPDATE bateaux SET captain_id = 3 WHERE id = 3 AND captain_id IS NULL;
UPDATE bateaux SET captain_id = 6 WHERE id = 4 AND captain_id IS NULL;

INSERT IGNORE INTO contrats (id, marin_id, contract_type, start_date, end_date, custom_share_weight, active, notes) VALUES
(1, 1, 'A_LA_PART', '2022-03-01', NULL, 2.00, 1, 'Contrat armement Concarneau'),
(2, 2, 'A_LA_PART', '2023-01-15', NULL, 2.00, 1, 'Commandement Brise d’Armor'),
(3, 3, 'CDI_MARITIME', '2020-07-01', NULL, 2.00, 1, 'Capitaine hauturier Méditerranée'),
(4, 4, 'A_LA_PART', '2024-02-01', '2026-12-15', 1.50, 1, 'Chef mécanicien'),
(5, 5, 'A_LA_PART', '2024-05-10', NULL, 1.50, 1, 'Second pont'),
(6, 6, 'CDD_SAISONNIER', '2026-04-01', '2026-12-05', 1.50, 1, 'Renfort saisonnier La Rochelle'),
(7, 7, 'A_LA_PART', '2025-01-12', NULL, 1.00, 1, 'Matelot filet'),
(8, 8, 'A_LA_PART', '2025-06-01', NULL, 1.00, 1, 'Matelot senneur');

INSERT IGNORE INTO absences (id, marin_id, absence_type, start_date, end_date, days, note) VALUES
(1, 1, 'FORMATION_STCW', '2026-06-10', '2026-06-13', 4, 'Recyclage sécurité maritime'),
(2, 3, 'CONGE_PAYE', '2026-08-01', '2026-08-14', 14, 'Congés annuels'),
(3, 6, 'REPOS_COMPENSATEUR', '2026-11-18', '2026-11-25', 7, 'Récupération marées hauturières');

INSERT IGNORE INTO documents_administratifs (id, marin_id, name, document_type, status, expiry_date, uploaded_at) VALUES
(1, 1, 'Brevet Capitaine 200', 'BREVET', 'VALIDE', '2028-05-20', NOW()),
(2, 1, 'Visite médicale gens de mer', 'MEDICAL', 'VALIDE', '2027-02-14', NOW()),
(3, 1, 'Certificat sécurité STCW', 'STCW', 'VALIDE', '2027-09-30', NOW()),
(4, 2, 'Brevet Capitaine Côtier', 'BREVET', 'VALIDE', '2027-11-10', NOW()),
(5, 2, 'Visite médicale gens de mer', 'MEDICAL', 'A_RENOUVELER', '2026-12-08', NOW()),
(6, 3, 'Brevet Capitaine 500', 'BREVET', 'VALIDE', '2029-01-12', NOW()),
(7, 3, 'Visite médicale gens de mer', 'MEDICAL', 'VALIDE', '2027-07-01', NOW()),
(8, 4, 'Brevet Mécanicien 750 kW', 'BREVET', 'VALIDE', '2028-03-19', NOW()),
(9, 4, 'Attestation prévention incendie', 'SECURITE', 'MANQUANT', NULL, NOW()),
(10, 5, 'Certificat Matelot Pont', 'BREVET', 'VALIDE', '2027-10-01', NOW()),
(11, 5, 'Visite médicale gens de mer', 'MEDICAL', 'VALIDE', '2027-04-22', NOW()),
(12, 6, 'Certificat Matelot Pont', 'BREVET', 'VALIDE', '2027-06-15', NOW()),
(13, 6, 'Passeport maritime', 'IDENTITE', 'A_RENOUVELER', '2026-11-30', NOW()),
(14, 7, 'Formation initiale sécurité', 'STCW', 'VALIDE', '2028-01-12', NOW()),
(15, 7, 'Visite médicale gens de mer', 'MEDICAL', 'VALIDE', '2027-08-09', NOW()),
(16, 8, 'Formation initiale sécurité', 'STCW', 'VALIDE', '2028-06-01', NOW()),
(17, 8, 'Visite médicale gens de mer', 'MEDICAL', 'MANQUANT', NULL, NOW());

INSERT IGNORE INTO sorties_peche (id, code, bateau_id, departure_date, return_date, zone, status, total_catch_kg, estimated_revenue, notes) VALUES
(1, 'MAR-2026-114', 1, '2026-11-03 04:30:00', '2026-11-06 16:15:00', 'Plateau de Rochebonne · Atlantique', 'TERMINEE', 4710.00, 61240.00, 'Excellente tenue des casiers, houle modérée.'),
(2, 'MAR-2026-115', 3, '2026-11-08 05:00:00', '2026-11-11 19:00:00', 'Golfe du Lion · Méditerranée', 'TERMINEE', 4280.00, 65530.00, 'Quota validé au débarquement criée de Sète.'),
(3, 'MAR-2026-116', 2, '2026-11-12 03:45:00', '2026-11-14 14:30:00', 'Îles Glénan · Sud Bretagne', 'TERMINEE', 3190.00, 28350.00, NULL),
(4, 'MAR-2026-117', 1, '2026-11-15 04:15:00', '2026-11-18 17:00:00', 'Mer d’Iroise · Large Ouessant', 'TERMINEE', 4180.00, 43776.00, NULL),
(5, 'MAR-2026-118', 2, '2026-11-21 04:00:00', '2026-11-23 18:00:00', 'Banc de Guérande · Atlantique', 'EN_COURS', 1850.00, 6290.00, 'Marée en cours — transmission AIS nominale.');

INSERT IGNORE INTO equipages (id, sortie_id, marin_id, role_at_sea, share_weight_snapshot) VALUES
(1, 1, 1, 'Capitaine', 2.00),
(2, 1, 4, 'Mécanicien', 1.50),
(3, 1, 5, 'Second', 1.50),
(4, 2, 3, 'Capitaine', 2.00),
(5, 2, 8, 'Matelot', 1.00),
(6, 3, 2, 'Capitaine', 2.00),
(7, 3, 7, 'Matelot', 1.00),
(8, 4, 1, 'Capitaine', 2.00),
(9, 4, 4, 'Mécanicien', 1.50),
(10, 4, 5, 'Second', 1.50),
(11, 5, 2, 'Capitaine', 2.00),
(12, 5, 7, 'Matelot', 1.00);

INSERT IGNORE INTO productions_peche (id, sortie_id, espece_id, quantity_kg, unit_price_per_kg, total_value, recorded_at) VALUES
(1, 1, 1, 1420.00, 18.50, 26270.00, '2026-11-06 16:15:00'),
(2, 1, 4, 2650.00, 7.40, 19610.00, '2026-11-06 16:15:00'),
(3, 1, 5, 640.00, 24.00, 15360.00, '2026-11-06 16:15:00'),
(4, 2, 3, 3100.00, 16.00, 49600.00, '2026-11-11 19:00:00'),
(5, 2, 2, 1180.00, 13.50, 15930.00, '2026-11-11 19:00:00'),
(6, 3, 8, 890.00, 21.00, 18690.00, '2026-11-14 14:30:00'),
(7, 3, 7, 2300.00, 4.20, 9660.00, '2026-11-14 14:30:00'),
(8, 4, 4, 3200.00, 7.80, 24960.00, '2026-11-18 17:00:00'),
(9, 4, 1, 980.00, 19.20, 18816.00, '2026-11-18 17:00:00'),
(10, 5, 6, 1850.00, 3.40, 6290.00, '2026-11-21 18:00:00');

INSERT IGNORE INTO ventes (id, sortie_id, bateau_id, espece_id, sale_date, buyer, quantity_kg, price_per_kg, total_amount) VALUES
(1, 1, 1, 1, '2026-11-06', 'Criée de Concarneau', 1420.00, 18.50, 26270.00),
(2, 1, 1, 4, '2026-11-06', 'Mareyeurs Bretons SAS', 2650.00, 7.40, 19610.00),
(3, 1, 1, 5, '2026-11-06', 'Halles Atlantique', 640.00, 24.00, 15360.00),
(4, 2, 3, 3, '2026-11-11', 'Criée de Sète Export', 3100.00, 16.00, 49600.00),
(5, 2, 3, 2, '2026-11-11', 'Poissonnerie Méditerranée', 1180.00, 13.50, 15930.00),
(6, 3, 2, 8, '2026-11-14', 'Criée de Lorient', 890.00, 21.00, 18690.00),
(7, 3, 2, 7, '2026-11-14', 'Conserverie d’Armor', 2300.00, 4.20, 9660.00),
(8, 4, 1, 4, '2026-11-18', 'Criée de Concarneau', 3200.00, 7.80, 24960.00),
(9, 4, 1, 1, '2026-11-18', 'Gastronomie Océane', 980.00, 19.20, 18816.00);

INSERT IGNORE INTO depenses (id, sortie_id, bateau_id, expense_date, category, description, amount) VALUES
(1, 1, 1, '2026-11-03', 'CARBURANT', 'Soutage gazole marin — 4 800 L', 5520.00),
(2, 1, 1, '2026-11-03', 'GLACE', 'Glace paillette cale réfrigérée (3,2 T)', 640.00),
(3, 1, 1, '2026-11-03', 'NOURRITURE', 'Avitaillement équipage 4 jours', 580.00),
(4, 2, 3, '2026-11-08', 'CARBURANT', 'Soutage gazole hauturier — 6 200 L', 7130.00),
(5, 2, 3, '2026-11-08', 'GLACE', 'Glace conservation thonier', 920.00),
(6, 3, 2, '2026-11-12', 'CARBURANT', 'Plein port de Lorient', 2890.00),
(7, 4, 1, '2026-11-15', 'CARBURANT', 'Gazole marin sortie Mer d’Iroise', 4950.00),
(8, NULL, 4, '2026-11-18', 'ENTRETIEN', 'Révision treuil hydraulique et carénage', 6400.00),
(9, 4, 1, '2026-11-18', 'AUTRES', 'Taxes portuaires et droits de criée', 1420.00);

INSERT IGNORE INTO paiements (id, sortie_id, marin_id, regle_id, period_label, gross_trip_revenue, common_expenses, net_distributable, crew_pool_amount, sailor_weight, total_crew_weights, amount_due, status, paid_at, created_at) VALUES
(1, 1, 1, 1, 'Marée MAR-2026-114', 61240.00, 6740.00, 54500.00, 29975.00, 2.00, 5.00, 11990.00, 'PAYE', '2026-11-08', NOW()),
(2, 1, 4, 1, 'Marée MAR-2026-114', 61240.00, 6740.00, 54500.00, 29975.00, 1.50, 5.00, 8992.50, 'PAYE', '2026-11-08', NOW()),
(3, 1, 5, 1, 'Marée MAR-2026-114', 61240.00, 6740.00, 54500.00, 29975.00, 1.50, 5.00, 8992.50, 'EN_ATTENTE', NULL, NOW()),
(4, 2, 3, 1, 'Marée MAR-2026-115', 65530.00, 8050.00, 57480.00, 31614.00, 2.00, 3.00, 21076.00, 'PAYE', '2026-11-13', NOW()),
(5, 2, 8, 1, 'Marée MAR-2026-115', 65530.00, 8050.00, 57480.00, 31614.00, 1.00, 3.00, 10538.00, 'EN_ATTENTE', NULL, NOW()),
(6, 3, 2, 1, 'Marée MAR-2026-116', 28350.00, 2890.00, 25460.00, 14003.00, 2.00, 3.00, 9335.33, 'EN_ATTENTE', NULL, NOW());

INSERT IGNORE INTO fiches_paiement (id, reference_number, paiement_id, generated_at, boat_share_percent_snapshot, crew_share_percent_snapshot, expenses_deducted, breakdown_json, issuer_name, remarks) VALUES
(1, 'FCH-2026-0001', 1, NOW(), 45.00, 55.00, 1, '{"trip":"MAR-2026-114","share":"2.0/5.0","net":11990.00}', 'Bahripay Armement', 'Règlement virement bancaire'),
(2, 'FCH-2026-0002', 2, NOW(), 45.00, 55.00, 1, '{"trip":"MAR-2026-114","share":"1.5/5.0","net":8992.50}', 'Bahripay Armement', 'Règlement virement bancaire'),
(3, 'FCH-2026-0003', 3, NOW(), 45.00, 55.00, 1, '{"trip":"MAR-2026-114","share":"1.5/5.0","net":8992.50}', 'Bahripay Armement', 'En attente de validation'),
(4, 'FCH-2026-0004', 4, NOW(), 45.00, 55.00, 1, '{"trip":"MAR-2026-115","share":"2.0/3.0","net":21076.00}', 'Bahripay Armement', 'Règlement criée Sète'),
(5, 'FCH-2026-0005', 5, NOW(), 45.00, 55.00, 1, '{"trip":"MAR-2026-115","share":"1.0/3.0","net":10538.00}', 'Bahripay Armement', 'En attente de validation'),
(6, 'FCH-2026-0006', 6, NOW(), 45.00, 55.00, 1, '{"trip":"MAR-2026-116","share":"2.0/3.0","net":9335.33}', 'Bahripay Armement', 'En attente de validation');

INSERT IGNORE INTO notifications (id, title, message, category, severity, created_at, is_read, target_page) VALUES
(1, '3 paiements équipage en attente', 'Un montant total de 28 865,83 DH reste à valider pour les marées MAR-2026-114, 115 et 116.', 'PAIEMENT', 'URGENT', NOW(), 0, 'finances'),
(2, 'Contrats CDD arrivant à échéance', 'Les contrats de Loïc Guégan et Thibault Mercier expirent prochainement.', 'CONTRAT', 'WARNING', NOW(), 0, 'sailors'),
(3, 'Documents administratifs manquants', '2 marins ont un document manquant (prévention incendie / visite médicale).', 'DOCUMENT', 'WARNING', NOW(), 0, 'sailors'),
(4, 'Sortie MAR-2026-118 en mer', 'Brise d’Armor a appareillé vers le Banc de Guérande avec 2 membres d’équipage.', 'SORTIE', 'INFO', NOW(), 1, 'fleet'),
(5, 'Nouvelle analyse Ocean AI disponible', 'Analyse comparative prête sur la rentabilité de la flotte et l’optimisation carburant.', 'IA', 'INFO', NOW(), 1, 'ocean-ai');
