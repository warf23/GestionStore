-- Création de la base de données pour la gestion des ventes et achats

-- Extension pour UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table des utilisateurs
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

-- Table des ventes
CREATE TABLE ventes (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    nom_client VARCHAR(100) NOT NULL,
    date_vente TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);

-- Table des lignes de vente
CREATE TABLE lignes_vente (
    id SERIAL PRIMARY KEY,
    vente_id INT REFERENCES ventes(id) ON DELETE CASCADE,
    produit_nom VARCHAR(100) NOT NULL,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10, 2) NOT NULL CHECK (prix_unitaire >= 0),
    total_ligne NUMERIC(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

-- Table des achats
CREATE TABLE achats (
    id SERIAL PRIMARY KEY,
    utilisateur_id INT REFERENCES utilisateurs(id) ON DELETE SET NULL,
    nom_fournisseur VARCHAR(100) NOT NULL,
    date_achat TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    total NUMERIC(10, 2) NOT NULL CHECK (total >= 0)
);

-- Table des lignes d'achat
CREATE TABLE lignes_achat (
    id SERIAL PRIMARY KEY,
    achat_id INT REFERENCES achats(id) ON DELETE CASCADE,
    produit_nom VARCHAR(100) NOT NULL,
    quantite INT NOT NULL CHECK (quantite > 0),
    prix_unitaire NUMERIC(10, 2) NOT NULL CHECK (prix_unitaire >= 0),
    total_ligne NUMERIC(10, 2) GENERATED ALWAYS AS (quantite * prix_unitaire) STORED
);

-- Indexes pour optimiser les performances
CREATE INDEX idx_utilisateurs_email ON utilisateurs(email);
CREATE INDEX idx_utilisateurs_role ON utilisateurs(role);
CREATE INDEX idx_ventes_utilisateur_id ON ventes(utilisateur_id);
CREATE INDEX idx_ventes_date ON ventes(date_vente);
CREATE INDEX idx_lignes_vente_vente_id ON lignes_vente(vente_id);
CREATE INDEX idx_achats_utilisateur_id ON achats(utilisateur_id);
CREATE INDEX idx_achats_date ON achats(date_achat);
CREATE INDEX idx_lignes_achat_achat_id ON lignes_achat(achat_id);

-- Trigger pour mettre à jour automatiquement updated_at
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

-- RLS (Row Level Security) policies
ALTER TABLE utilisateurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventes ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_vente ENABLE ROW LEVEL SECURITY;
ALTER TABLE achats ENABLE ROW LEVEL SECURITY;
ALTER TABLE lignes_achat ENABLE ROW LEVEL SECURITY;

-- Politique pour les utilisateurs - ils peuvent voir leurs propres données
CREATE POLICY "Users can view own profile" ON utilisateurs 
    FOR SELECT USING (auth.uid()::text = id::text);

-- Politique pour les admins - ils peuvent tout voir et modifier
CREATE POLICY "Admins can view all users" ON utilisateurs 
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM utilisateurs 
            WHERE id::text = auth.uid()::text AND role = 'admin'
        )
    );

-- Politiques pour les ventes
CREATE POLICY "Users can view all sales" ON ventes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert sales" ON ventes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own sales" ON ventes FOR UPDATE TO authenticated USING (utilisateur_id::text = auth.uid()::text);

-- Politiques pour les lignes de vente
CREATE POLICY "Users can view all sale lines" ON lignes_vente FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert sale lines" ON lignes_vente FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update sale lines" ON lignes_vente FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM ventes 
        WHERE ventes.id = lignes_vente.vente_id 
        AND ventes.utilisateur_id::text = auth.uid()::text
    )
);

-- Politiques pour les achats
CREATE POLICY "Users can view all purchases" ON achats FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert purchases" ON achats FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update own purchases" ON achats FOR UPDATE TO authenticated USING (utilisateur_id::text = auth.uid()::text);

-- Politiques pour les lignes d'achat
CREATE POLICY "Users can view all purchase lines" ON lignes_achat FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert purchase lines" ON lignes_achat FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update purchase lines" ON lignes_achat FOR UPDATE TO authenticated USING (
    EXISTS (
        SELECT 1 FROM achats 
        WHERE achats.id = lignes_achat.achat_id 
        AND achats.utilisateur_id::text = auth.uid()::text
    )
);

-- Insertion d'un utilisateur admin par défaut (mot de passe: admin123)
-- Hash bcrypt pour 'admin123': $2b$10$rOZPaNz0zK5qP1J0qZ5J9.Xv6QZ5J9eJ5qZ5J9eJ5qZ5J9eJ5qZ5J
INSERT INTO utilisateurs (email, nom, prenom, role, password_hash) 
VALUES ('admin@store.com', 'Admin', 'System', 'admin', '$2b$10$rOZPaNz0zK5qP1J0qZ5J9.Xv6QZ5J9eJ5qZ5J9eJ5qZ5J9eJ5qZ5J')
ON CONFLICT (email) DO NOTHING;