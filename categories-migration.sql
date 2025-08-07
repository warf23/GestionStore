-- Migration script to add categories to existing database
-- Run this in your Supabase SQL Editor

-- Step 1: Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    couleur VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Step 2: Add category_id column to existing tables
ALTER TABLE lignes_vente ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE lignes_achat ADD COLUMN IF NOT EXISTS category_id INT REFERENCES categories(id) ON DELETE SET NULL;

-- Step 3: Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_nom ON categories(nom);
CREATE INDEX IF NOT EXISTS idx_lignes_vente_category_id ON lignes_vente(category_id);
CREATE INDEX IF NOT EXISTS idx_lignes_achat_category_id ON lignes_achat(category_id);

-- Step 4: Create trigger for updated_at
CREATE TRIGGER IF NOT EXISTS update_categories_updated_at 
    BEFORE UPDATE ON categories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Step 5: Enable RLS
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies
DROP POLICY IF EXISTS "Users can view all categories" ON categories;
DROP POLICY IF EXISTS "Admins can manage categories" ON categories;

CREATE POLICY "Users can view all categories" ON categories FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage categories" ON categories FOR ALL TO authenticated USING (
    EXISTS (
        SELECT 1 FROM utilisateurs 
        WHERE id::text = auth.uid()::text AND role = 'admin'
    )
);

-- Step 7: Insert default categories
INSERT INTO categories (nom, description, couleur) VALUES
('Électronique', 'Appareils électroniques et accessoires', '#3B82F6'),
('Vêtements', 'Vêtements et accessoires de mode', '#EF4444'),
('Alimentation', 'Produits alimentaires et boissons', '#10B981'),
('Beauté', 'Produits de beauté et soins personnels', '#F59E0B'),
('Maison', 'Articles pour la maison et décoration', '#8B5CF6'),
('Sport', 'Équipements et articles de sport', '#06B6D4')
ON CONFLICT (nom) DO NOTHING;