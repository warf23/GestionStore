import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

// GET /api/products/low-stock - Get all products with low stock
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const threshold = parseInt(searchParams.get('threshold') || '5')

    const supabase = createAdminClient()

    // Get all purchase lines
    const { data: purchaseLines, error: purchaseError } = await supabase
      .from('lignes_achat')
      .select(`
        produit_nom,
        quantite,
        prix_unitaire,
        category_id,
        achats!inner(date_achat)
      `)

    if (purchaseError) {
      console.error('Error fetching purchase lines:', purchaseError)
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
    }

    // Get all sale lines
    const { data: saleLines, error: saleError } = await supabase
      .from('lignes_vente')
      .select('produit_nom, quantite, category_id')

    if (saleError) {
      console.error('Error fetching sale lines:', saleError)
      return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
    }

    // Get category names for reference
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, nom, couleur')

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

    // Calculate stock for each product
    const productMap = new Map()

    // Process purchases
    purchaseLines?.forEach((line: any) => {
      const key = `${line.produit_nom}_${line.category_id || 'uncategorized'}`
      if (!productMap.has(key)) {
        productMap.set(key, {
          produit_nom: line.produit_nom,
          category_id: line.category_id,
          category_nom: line.category_id ? categoryMap.get(line.category_id)?.nom || 'Catégorie inconnue' : 'Sans catégorie',
          category_couleur: line.category_id ? categoryMap.get(line.category_id)?.couleur || '#6B7280' : '#6B7280',
          quantite_achetee: 0,
          quantite_vendue: 0,
          dernier_prix_achat: 0
        })
      }
      const product = productMap.get(key)
      product.quantite_achetee += line.quantite
      product.dernier_prix_achat = line.prix_unitaire
    })

    // Process sales
    saleLines?.forEach((line: any) => {
      // First try to find by product name and category_id
      let key = `${line.produit_nom}_${line.category_id || 'uncategorized'}`
      let product = productMap.get(key)
      
      // If not found and category_id is null, try to find by product name only
      if (!product && !line.category_id) {
        // Look for any product with this name regardless of category
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

    // Convert to array, calculate stock, and filter low stock
    const lowStockProducts = Array.from(productMap.values())
      .map((product: any) => ({
        ...product,
        quantite_disponible: product.quantite_achetee - product.quantite_vendue,
        is_low_stock: (product.quantite_achetee - product.quantite_vendue) <= threshold
      }))
      .filter((product: any) => product.is_low_stock && product.quantite_disponible >= 0)
      .sort((a: any, b: any) => {
        // Sort by stock level (lowest first), then by name
        if (a.quantite_disponible !== b.quantite_disponible) {
          return a.quantite_disponible - b.quantite_disponible
        }
        return a.produit_nom.localeCompare(b.produit_nom)
      })

    return NextResponse.json({ products: lowStockProducts, threshold })
  } catch (error) {
    console.error('Error in low stock products endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}