-- Migration to add wood types functionality
-- This allows tracking different types of wood for products

-- Create wood_types table
CREATE TABLE IF NOT EXISTS wood_types (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    couleur VARCHAR(7) DEFAULT '#8B4513', -- Brown color by default
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add wood_type_id to lignes_achat table
ALTER TABLE lignes_achat ADD COLUMN IF NOT EXISTS wood_type_id INT REFERENCES wood_types(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_lignes_achat_wood_type_id ON lignes_achat(wood_type_id);

-- Insert some default wood types
INSERT INTO wood_types (nom, description, couleur) VALUES 
    ('Chêne', 'Bois dur, résistant et durable', '#8B4513'),
    ('Pin', 'Bois tendre, facile à travailler', '#DEB887'),
    ('Hêtre', 'Bois dur, grain fin', '#D2691E'),
    ('Sapin', 'Bois tendre, utilisé en construction', '#F5DEB3'),
    ('Acajou', 'Bois exotique, couleur rougeâtre', '#CD853F'),
    ('Érable', 'Bois dur, grain serré', '#F4A460')
ON CONFLICT (nom) DO NOTHING;

-- Enable RLS (Row Level Security) for wood_types
ALTER TABLE wood_types ENABLE ROW LEVEL SECURITY;

-- Create policies for wood_types
CREATE POLICY "Users can view all wood types" ON wood_types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can insert wood types" ON wood_types FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Users can update wood types" ON wood_types FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Users can delete wood types" ON wood_types FOR DELETE TO authenticated USING (true);