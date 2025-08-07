import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

const LOW_STOCK_THRESHOLD = 5

// GET /api/categories/[id]/products - Fetch products for a specific category with stock
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const categoryId = parseInt(params.id)
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

    // Get purchase lines for this category
    const { data: purchaseLines, error: purchaseError } = await supabase
      .from('lignes_achat')
      .select(`
        produit_nom,
        quantite,
        prix_unitaire,
        achats!inner(date_achat)
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

    // Calculate stock for each product
    const productMap = new Map()

    // Process purchases
    purchaseLines?.forEach((line: any) => {
      const productName = line.produit_nom
      if (!productMap.has(productName)) {
        productMap.set(productName, {
          produit_nom: productName,
          category_id: categoryId,
          quantite_achetee: 0,
          quantite_vendue: 0,
          dernier_prix_achat: 0
        })
      }
      const product = productMap.get(productName)
      product.quantite_achetee += line.quantite
      product.dernier_prix_achat = line.prix_unitaire
    })

    // Process sales
    saleLines?.forEach((line: any) => {
      const productName = line.produit_nom
      if (productMap.has(productName)) {
        const product = productMap.get(productName)
        product.quantite_vendue += line.quantite
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