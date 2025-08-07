import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

// GET /api/products/suggestions - Get product suggestions with available quantities
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get search query parameter
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    // Get all purchase lines (products bought) with categories and wood types
    const { data: purchaseLines, error: purchaseError } = await supabase
      .from('lignes_achat')
      .select(`
        produit_nom,
        quantite,
        prix_unitaire,
        category_id,
        wood_type_id,
        achats!inner(date_achat),
        categories(id, nom, couleur),
        wood_types(id, nom, couleur)
      `)

    if (purchaseError) {
      console.error('Error fetching purchase lines:', purchaseError)
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
    }

    // Get all sale lines (products sold)
    const { data: saleLines, error: saleError } = await supabase
      .from('lignes_vente')
      .select('produit_nom, quantite')

    if (saleError) {
      console.error('Error fetching sale lines:', saleError)
      return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
    }

    // Calculate stock for each product with category and wood type info
    const productMap = new Map()

    // Process purchases
    purchaseLines?.forEach((line: any) => {
      const productKey = `${line.produit_nom}_${line.category_id || 'uncategorized'}_${line.wood_type_id || 'no_wood'}`
      if (!productMap.has(productKey)) {
        productMap.set(productKey, {
          produit_nom: line.produit_nom,
          category_id: line.category_id,
          category_nom: line.categories?.nom || 'Sans catégorie',
          category_couleur: line.categories?.couleur || '#6B7280',
          wood_type_id: line.wood_type_id,
          wood_type_nom: line.wood_types?.nom || null,
          wood_type_couleur: line.wood_types?.couleur || null,
          quantite_achetee: 0,
          quantite_vendue: 0,
          dernier_prix_achat: 0
        })
      }
      const product = productMap.get(productKey)
      product.quantite_achetee += line.quantite
      product.dernier_prix_achat = line.prix_unitaire // Keep updating with latest
    })

    // Process sales - try to match with purchase data
    saleLines?.forEach((line: any) => {
      // Try to find matching product in purchases
      for (const [productKey, product] of productMap.entries()) {
        if (product.produit_nom === line.produit_nom) {
          product.quantite_vendue += line.quantite
          break
        }
      }
    })

    // Convert to array and filter by search query
    const allProducts = Array.from(productMap.values())
      .map((product: any) => ({
        ...product,
        quantite_disponible: product.quantite_achetee - product.quantite_vendue
      }))
      .filter((product: any) => {
        const hasStock = product.quantite_disponible > 0
        const matchesQuery = !query || 
          product.produit_nom.toLowerCase().includes(query.toLowerCase()) ||
          product.category_nom.toLowerCase().includes(query.toLowerCase()) ||
          (product.wood_type_nom && product.wood_type_nom.toLowerCase().includes(query.toLowerCase()))
        return hasStock && matchesQuery
      })
      .sort((a: any, b: any) => {
        if (!query) return a.produit_nom.localeCompare(b.produit_nom)
        // Sort by relevance: exact match first, then starts with, then contains
        const aName = a.produit_nom.toLowerCase()
        const bName = b.produit_nom.toLowerCase()
        const queryLower = query.toLowerCase()
        
        if (aName === queryLower && bName !== queryLower) return -1
        if (bName === queryLower && aName !== queryLower) return 1
        if (aName.startsWith(queryLower) && !bName.startsWith(queryLower)) return -1
        if (bName.startsWith(queryLower) && !aName.startsWith(queryLower)) return 1
        return aName.localeCompare(bName)
      })

    return NextResponse.json({ products: allProducts })
  } catch (error) {
    console.error('Error in product suggestions endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}