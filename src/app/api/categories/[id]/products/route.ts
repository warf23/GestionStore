import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

const LOW_STOCK_THRESHOLD = 5

// GET /api/categories/[id]/products - Fetch products for a specific category with stock
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const { id } = await params
    const categoryId = parseInt(id)
    if (isNaN(categoryId)) {
      return NextResponse.json({ error: 'ID de catégorie invalide' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Verify category exists
    const { data: category, error: categoryError } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .single()

    if (categoryError || !category) {
      return NextResponse.json({ error: 'Catégorie non trouvée' }, { status: 404 })
    }

    // Get purchase lines for this category with wood types
    const { data: purchaseLines, error: purchaseError } = await supabase
      .from('lignes_achat')
      .select(`
        produit_nom,
        quantite,
        prix_unitaire,
        wood_type_id,
        achats!inner(date_achat),
        wood_types(id, nom, couleur)
      `)
      .eq('category_id', categoryId)

    if (purchaseError) {
      console.error('Error fetching purchase lines:', purchaseError)
      return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
    }

    // Get sale lines for this category
    const { data: saleLines, error: saleError } = await supabase
      .from('lignes_vente')
      .select('produit_nom, quantite')
      .eq('category_id', categoryId)

    if (saleError) {
      console.error('Error fetching sale lines:', saleError)
      return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
    }

    // Calculate stock for each product with wood type grouping
    const productMap = new Map()

    // Process purchases
    purchaseLines?.forEach((line: any) => {
      const productKey = `${line.produit_nom}_${line.wood_type_id || 'no_wood'}`
      if (!productMap.has(productKey)) {
        productMap.set(productKey, {
          produit_nom: line.produit_nom,
          category_id: categoryId,
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
      product.dernier_prix_achat = line.prix_unitaire
    })

    // Process sales - match with purchase data
    saleLines?.forEach((line: any) => {
      // Try to find matching product in purchases
      for (const [productKey, product] of productMap.entries()) {
        if (product.produit_nom === line.produit_nom) {
          product.quantite_vendue += line.quantite
          break
        }
      }
    })

    // Convert to array with calculated stock
    const products = Array.from(productMap.values())
      .map((product: any) => ({
        ...product,
        quantite_disponible: product.quantite_achetee - product.quantite_vendue,
        is_low_stock: (product.quantite_achetee - product.quantite_vendue) <= LOW_STOCK_THRESHOLD
      }))
      .sort((a: any, b: any) => a.produit_nom.localeCompare(b.produit_nom))

    return NextResponse.json({ products })
  } catch (error) {
    console.error('Error in category products endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}