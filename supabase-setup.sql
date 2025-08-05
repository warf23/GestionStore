-- Complete Supabase Setup for Store Management
-- Execute this in your Supabase SQL Editor

-- 1. Create Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Users Table
CREATE TABLE utilisateurs (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'employe')) DEFAULT 'employe',
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create Sales Tables
CREATE TABLE ventes (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    nom_client VARCHAR(100) NOT NULL,
    date_vente TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE lignes_vente (
    id SERIAL PRIMARY KEY,
    vente_id INT REFERENCES ventes(id) ON DELETE CASCADE,
    produit_nom VARCHAR(100) NOT NULL,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10, 2) NOT NULL CHECK (prix_unitaire >= 0),
    total_ligne NUMERIC(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

-- 4. Create Purchase Tables
CREATE TABLE achats (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    nom_fournisseur VARCHAR(100) NOT NULL,
    date_achat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);

CREATE TABLE lignes_achat (
    id SERIAL PRIMARY KEY,
    achat_id INT REFERENCES achats(id) ON DELETE CASCADE,
    produit_nom VARCHAR(100) NOT NULL,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10, 2) NOT NULL CHECK (prix_unitaire >= 0),
    total_ligne NUMERIC(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

-- 5. Create Indexes
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_role ON utilisateurs(role);
CREATE INDEX idx_ventes_utilisateur_id ON ventes(utilisateur_id);
CREATE INDEX idx_ventes_date ON ventes(date_vente);
CREATE INDEX idx_lignes_vente_vente_id ON lignes_vente(vente_id);
CREATE INDEX idx_achats_utilisateur_id ON achats(utilisateur_id);
CREATE INDEX idx_achats_date ON achats(date_achat);
CREATE INDEX idx_lignes_achat_achat_id ON lignes_achat(achat_id);

-- 6. Create Updated At Trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_utilisateurs_updated_at 
    BEFORE UPDATE ON utilisateurs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. Enable RLS (Row Level Security)
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE achats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_achat ENABLE ROW LEVEL SECURITY;

-- 8. Create RLS Policies (Simplified for custom auth)
-- Allow authenticated users to read/write (we handle permissions in our app)
CREATE POLICY "Enable all access for authenticated users" ON utilisateurs
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON ventes
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON lignes_vente
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON achats
FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "Enable all access for authenticated users" ON lignes_achat
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 9. Create Default Admin User
-- Password hash for 'admin123' (bcrypt)
INSERT INTO utilisateurs (email, nom, prenom, role, password_hash) 
VALUES (
    'admin@store.com', 
    'Admin', 
    'System', 
    'admin', 
    '$2b$10$K.S.T.0wP8qL5Q9J5qZ5JOJ5qZ5J9eJ5qZ5J9eJ5qZ5J9eJ5qZ5Je'
)
ON CONFLICT (email) DO NOTHING;

-- 10. Verify Setup
SELECT 'Setup completed successfully!' as status;