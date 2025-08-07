-- Script to assign default categories to existing products
-- Run this AFTER the categories-migration.sql script

-- Update existing purchase lines with default categories based on product names
-- You can customize these patterns based on your actual product names

UPDATE lignes_achat SET category_id = (
    SELECT id FROM categories WHERE nom = 'Électronique'
) WHERE category_id IS NULL AND (
    produit_nom ILIKE '%phone%' OR 
    produit_nom ILIKE '%ordinateur%' OR 
    produit_nom ILIKE '%laptop%' OR 
    produit_nom ILIKE '%écran%' OR 
    produit_nom ILIKE '%télé%' OR
    produit_nom ILIKE '%électronique%'
);

UPDATE lignes_achat SET category_id = (
    SELECT id FROM categories WHERE nom = 'Vêtements'
) WHERE category_id IS NULL AND (
    produit_nom ILIKE '%shirt%' OR 
    produit_nom ILIKE '%pantalon%' OR 
    produit_nom ILIKE '%robe%' OR 
    produit_nom ILIKE '%chaussure%' OR 
    produit_nom ILIKE '%vêtement%'
);

UPDATE lignes_achat SET category_id = (
    SELECT id FROM categories WHERE nom = 'Alimentation'
) WHERE category_id IS NULL AND (
    produit_nom ILIKE '%pain%' OR 
    produit_nom ILIKE '%lait%' OR 
    produit_nom ILIKE '%eau%' OR 
    produit_nom ILIKE '%nourriture%' OR 
    produit_nom ILIKE '%alimentation%'
);

-- Set remaining products to a default category (Maison)
UPDATE lignes_achat SET category_id = (
    SELECT id FROM categories WHERE nom = 'Maison' LIMIT 1
) WHERE category_id IS NULL;

-- Update sale lines with same logic
UPDATE lignes_vente SET category_id = (
    SELECT la.category_id 
    FROM lignes_achat la 
    WHERE la.produit_nom = lignes_vente.produit_nom 
    AND la.category_id IS NOT NULL 
    LIMIT 1
) WHERE category_id IS NULL;

-- Set remaining sale products to default category
UPDATE lignes_vente SET category_id = (
    SELECT id FROM categories WHERE nom = 'Maison' LIMIT 1
) WHERE category_id IS NULL;