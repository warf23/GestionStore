# Alerts System Fix - Complete Solution

## Problem Identified

The alerts system was not working because **sales lines were not saving `category_id`**, which meant the low-stock calculation API couldn't properly match products between purchases and sales.

### Root Cause:
- Purchase lines correctly save `category_id` when created
- **Sales lines were NOT saving `category_id`** when created
- Low-stock API uses `produit_nom_category_id` as a key to match products
- Without `category_id`, sales couldn't be matched to purchases
- This led to incorrect stock calculations and no alerts

## Files Fixed

### 1. **src/app/api/sales/route.ts** (CREATE Sales)
**Problem:** Sales lines created without `category_id`
```typescript
// BEFORE (❌ Missing category_id)
const saleLines = lignes.map((ligne: any) => ({
  vente_id: sale.id,
  produit_nom: ligne.produit_nom,
  quantite: ligne.quantite,
  prix_unitaire: ligne.prix_unitaire
}))
```

**Solution:** Added category lookup and save `category_id`
```typescript
// AFTER (✅ With category_id)
// Look up category_id from purchase data
const productNames = lignes.map((ligne: any) => ligne.produit_nom)
const { data: purchaseData } = await supabase
  .from('lignes_achat')
  .select('produit_nom, category_id')
  .in('produit_nom', productNames)

const productCategoryMap = new Map()
purchaseData?.forEach((item: any) => {
  if (!productCategoryMap.has(item.produit_nom)) {
    productCategoryMap.set(item.produit_nom, item.category_id)
  }
})

const saleLines = lignes.map((ligne: any) => ({
  vente_id: sale.id,
  produit_nom: ligne.produit_nom,
  category_id: productCategoryMap.get(ligne.produit_nom) || null, // ✅ Added
  quantite: ligne.quantite,
  prix_unitaire: ligne.prix_unitaire
}))
```

### 2. **src/app/api/sales/[id]/route.ts** (UPDATE Sales)
**Problem:** Same issue when updating sales
**Solution:** Applied the same category lookup logic for sale updates

### 3. **src/app/api/products/low-stock/route.ts** (Stock Calculation)
**Problem:** Couldn't match sales to purchases when `category_id` was missing
**Solution:** Added fallback logic to match by product name only when `category_id` is null

```typescript
// BEFORE (❌ Rigid matching)
saleLines?.forEach((line: any) => {
  const key = `${line.produit_nom}_${line.category_id || 'uncategorized'}`
  if (productMap.has(key)) {
    const product = productMap.get(key)
    product.quantite_vendue += line.quantite
  }
})

// AFTER (✅ Flexible matching)
saleLines?.forEach((line: any) => {
  let key = `${line.produit_nom}_${line.category_id || 'uncategorized'}`
  let product = productMap.get(key)
  
  // Fallback: if category_id is null, find by product name only
  if (!product && !line.category_id) {
    for (const [mapKey, mapProduct] of productMap.entries()) {
      if (mapKey.startsWith(`${line.produit_nom}_`)) {
        product = mapProduct
        break
      }
    }
  }
  
  if (product) {
    product.quantite_vendue += line.quantite
  }
})
```

## Database Migration Required

Created `fix-existing-sales-category.sql` to update existing sales data:

```sql
-- Update existing sales lines to include category_id
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
```

## How It Works Now

1. **When creating a sale:**
   - Looks up each product's `category_id` from purchase history
   - Saves sale lines with correct `category_id`
   - Ensures proper product matching for stock calculations

2. **Stock calculation:**
   - Matches purchases and sales by `produit_nom + category_id`
   - Falls back to product name matching for legacy data
   - Correctly calculates available stock
   - Shows alerts when stock is low

3. **Real-time updates:**
   - All previous improvements for real-time alerts still work
   - Now with correct stock calculations

## Expected Results

After applying this fix:

✅ **Sales will now properly reduce stock counts**
✅ **Alerts will show when stock drops below threshold**  
✅ **Stock calculations will be accurate**
✅ **Real-time updates will work correctly**

## Test Steps

1. **Run the database migration:**
   ```sql
   -- Execute fix-existing-sales-category.sql
   ```

2. **Test the fix:**
   - Make a sale of products you have in stock
   - Check if alerts appear when stock drops below threshold (default: 5)
   - Verify stock counts are accurate on the settings page

3. **Verify real-time updates:**
   - Make a sale and verify alerts update within 15 seconds
   - Check that stock counts reflect the sale immediately

## Why This Fix is Complete

1. **Root cause addressed:** Sales now save `category_id`
2. **Backward compatibility:** Handles existing data without `category_id`
3. **Real-time functionality:** All previous improvements preserved
4. **Data integrity:** Migration script fixes historical data
5. **Robust matching:** Fallback logic prevents missed matches

The alerts system should now work correctly and show low stock warnings as expected!