-- ==============================================================================
-- Bahripay Maritime & Fishing Management - Normalized MySQL 8 Schema (19 Tables)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(40) NOT NULL UNIQUE,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(180) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    port_attache VARCHAR(120) NOT NULL DEFAULT 'Concarneau',
    avatar_initials VARCHAR(8) NOT NULL,
    role_id BIGINT NOT NULL,
    enabled BIT(1) NOT NULL DEFAULT 1,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS grades (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(40) NOT NULL UNIQUE,
    label VARCHAR(80) NOT NULL UNIQUE,
    default_share_weight DECIMAL(5,2) NOT NULL,
    description VARCHAR(255)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS bateaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    registration VARCHAR(60) NOT NULL UNIQUE,
    vessel_type VARCHAR(100) NOT NULL,
    capacity_kg INT NOT NULL,
    engine_power_hp INT NOT NULL,
    length_meters DECIMAL(5,2) NOT NULL,
    home_port VARCHAR(120) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE',
    captain_id BIGINT NULL,
    last_maintenance_date DATE NULL,
    image_url VARCHAR(500) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS marins (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    registration_number VARCHAR(60) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(40) NOT NULL,
    email VARCHAR(180) NOT NULL,
    grade_id BIGINT NOT NULL,
    share_weight DECIMAL(5,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIF',
    port_attache VARCHAR(120) NOT NULL,
    years_experience INT NOT NULL DEFAULT 1,
    bateau_id BIGINT NULL,
    CONSTRAINT fk_marins_grade FOREIGN KEY (grade_id) REFERENCES grades(id),
    CONSTRAINT fk_marins_bateau FOREIGN KEY (bateau_id) REFERENCES bateaux(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS contrats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    marin_id BIGINT NOT NULL,
    contract_type VARCHAR(40) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NULL,
    custom_share_weight DECIMAL(5,2) NULL,
    active BIT(1) NOT NULL DEFAULT 1,
    notes VARCHAR(500) NULL,
    CONSTRAINT fk_contrats_marin FOREIGN KEY (marin_id) REFERENCES marins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS absences (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    marin_id BIGINT NOT NULL,
    absence_type VARCHAR(40) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    days INT NOT NULL,
    note VARCHAR(500) NULL,
    CONSTRAINT fk_absences_marin FOREIGN KEY (marin_id) REFERENCES marins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents_administratifs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    marin_id BIGINT NOT NULL,
    name VARCHAR(180) NOT NULL,
    document_type VARCHAR(80) NULL,
    file_name VARCHAR(255) NULL,
    file_path VARCHAR(500) NULL,
    content_type VARCHAR(120) NULL,
    file_size BIGINT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'VALIDE',
    expiry_date DATE NULL,
    uploaded_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_docs_marin FOREIGN KEY (marin_id) REFERENCES marins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS especes_poisson (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL UNIQUE,
    scientific_name VARCHAR(120) NULL,
    default_price_per_kg DECIMAL(8,2) NOT NULL,
    category VARCHAR(80) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS sorties_peche (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    bateau_id BIGINT NOT NULL,
    departure_date DATETIME(6) NOT NULL,
    return_date DATETIME(6) NULL,
    zone VARCHAR(180) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PLANIFIEE',
    total_catch_kg DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    estimated_revenue DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    notes VARCHAR(600) NULL,
    CONSTRAINT fk_sorties_bateau FOREIGN KEY (bateau_id) REFERENCES bateaux(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS equipages (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sortie_id BIGINT NOT NULL,
    marin_id BIGINT NOT NULL,
    role_at_sea VARCHAR(80) NULL,
    share_weight_snapshot DECIMAL(5,2) NOT NULL,
    CONSTRAINT uk_equipage_sortie_marin UNIQUE (sortie_id, marin_id),
    CONSTRAINT fk_equipage_sortie FOREIGN KEY (sortie_id) REFERENCES sorties_peche(id) ON DELETE CASCADE,
    CONSTRAINT fk_equipage_marin FOREIGN KEY (marin_id) REFERENCES marins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS productions_peche (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sortie_id BIGINT NOT NULL,
    espece_id BIGINT NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    unit_price_per_kg DECIMAL(8,2) NOT NULL,
    total_value DECIMAL(12,2) NOT NULL,
    recorded_at DATETIME(6) NOT NULL,
    CONSTRAINT fk_prod_sortie FOREIGN KEY (sortie_id) REFERENCES sorties_peche(id) ON DELETE CASCADE,
    CONSTRAINT fk_prod_espece FOREIGN KEY (espece_id) REFERENCES especes_poisson(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ventes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sortie_id BIGINT NULL,
    bateau_id BIGINT NOT NULL,
    espece_id BIGINT NOT NULL,
    sale_date DATE NOT NULL,
    buyer VARCHAR(150) NOT NULL,
    quantity_kg DECIMAL(10,2) NOT NULL,
    price_per_kg DECIMAL(8,2) NOT NULL,
    total_amount DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_ventes_sortie FOREIGN KEY (sortie_id) REFERENCES sorties_peche(id) ON DELETE SET NULL,
    CONSTRAINT fk_ventes_bateau FOREIGN KEY (bateau_id) REFERENCES bateaux(id),
    CONSTRAINT fk_ventes_espece FOREIGN KEY (espece_id) REFERENCES especes_poisson(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS depenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sortie_id BIGINT NULL,
    bateau_id BIGINT NOT NULL,
    expense_date DATE NOT NULL,
    category VARCHAR(30) NOT NULL,
    description VARCHAR(255) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_depenses_sortie FOREIGN KEY (sortie_id) REFERENCES sorties_peche(id) ON DELETE SET NULL,
    CONSTRAINT fk_depenses_bateau FOREIGN KEY (bateau_id) REFERENCES bateaux(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS regles_repartition (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    rule_name VARCHAR(120) NOT NULL,
    boat_share_percent DECIMAL(5,2) NOT NULL,
    crew_share_percent DECIMAL(5,2) NOT NULL,
    deduct_common_expenses_before_split BIT(1) NOT NULL DEFAULT 1,
    active BIT(1) NOT NULL DEFAULT 1,
    updated_at DATETIME(6) NOT NULL,
    updated_by_email VARCHAR(180) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS paiements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    sortie_id BIGINT NOT NULL,
    marin_id BIGINT NOT NULL,
    regle_id BIGINT NOT NULL,
    period_label VARCHAR(120) NOT NULL,
    gross_trip_revenue DECIMAL(12,2) NOT NULL,
    common_expenses DECIMAL(12,2) NOT NULL,
    net_distributable DECIMAL(12,2) NOT NULL,
    crew_pool_amount DECIMAL(12,2) NOT NULL,
    sailor_weight DECIMAL(5,2) NOT NULL,
    total_crew_weights DECIMAL(7,2) NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'EN_ATTENTE',
    paid_at DATE NULL,
    created_at DATETIME(6) NOT NULL,
    CONSTRAINT uk_paiement_sortie_marin UNIQUE (sortie_id, marin_id),
    CONSTRAINT fk_paiements_sortie FOREIGN KEY (sortie_id) REFERENCES sorties_peche(id),
    CONSTRAINT fk_paiements_marin FOREIGN KEY (marin_id) REFERENCES marins(id),
    CONSTRAINT fk_paiements_regle FOREIGN KEY (regle_id) REFERENCES regles_repartition(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS fiches_paiement (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    reference_number VARCHAR(60) NOT NULL UNIQUE,
    paiement_id BIGINT NOT NULL UNIQUE,
    generated_at DATETIME(6) NOT NULL,
    boat_share_percent_snapshot DECIMAL(5,2) NOT NULL,
    crew_share_percent_snapshot DECIMAL(5,2) NOT NULL,
    expenses_deducted BIT(1) NOT NULL,
    breakdown_json TEXT NULL,
    issuer_name VARCHAR(150) NULL,
    remarks VARCHAR(400) NULL,
    CONSTRAINT fk_fiche_paiement FOREIGN KEY (paiement_id) REFERENCES paiements(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(180) NOT NULL,
    message VARCHAR(600) NOT NULL,
    category VARCHAR(30) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'INFO',
    created_at DATETIME(6) NOT NULL,
    is_read BIT(1) NOT NULL DEFAULT 0,
    target_page VARCHAR(50) NULL,
    user_id BIGINT NULL,
    CONSTRAINT fk_notifications_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS predictions_ia (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    analysis_type VARCHAR(60) NOT NULL,
    prompt_question VARCHAR(500) NULL,
    answer_summary TEXT NOT NULL,
    predicted_catch_kg DECIMAL(12,2) NULL,
    predicted_revenue DECIMAL(12,2) NULL,
    confidence_score DECIMAL(5,2) NULL,
    sufficient_data BIT(1) NOT NULL,
    data_points_used INT NOT NULL,
    is_prediction BIT(1) NOT NULL DEFAULT 1,
    model_name VARCHAR(80) NULL,
    created_at DATETIME(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
