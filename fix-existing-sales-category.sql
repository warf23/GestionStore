-- Update existing sales lines to include category_id based on product name from purchase lines
-- This fixes the issue where sales lines don't have category_id which breaks stock calculations

-- Update lignes_vente with category_id from the most recent purchase of the same product
UPDATE lignes_vente 
SET category_id = (
  SELECT DISTINCT ON (la.produit_nom) la.category_id
  FROM lignes_achat la
  WHERE la.produit_nom = lignes_vente.produit_nom
  ORDER BY la.produit_nom, la.id DESC
  LIMIT 1
)
WHERE category_id IS NULL 
AND produit_nom IN (
  SELECT DISTINCT produit_nom 
  FROM lignes_achat 
  WHERE category_id IS NOT NULL
);

-- Verify the update
SELECT 
  'Before' as status,
  COUNT(*) as total_sales_lines,
  COUNT(category_id) as with_category,
  COUNT(*) - COUNT(category_id) as without_category
FROM lignes_vente
WHERE FALSE  -- This won't run, just for reference

UNION ALL

SELECT 
  'After' as status,
  COUNT(*) as total_sales_lines,
  COUNT(category_id) as with_category,
  COUNT(*) - COUNT(category_id) as without_category
FROM lignes_vente;