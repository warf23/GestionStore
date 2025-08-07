import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getCurrentUser } from '@/lib/auth'

const LOW_STOCK_THRESHOLD = 5

// GET /api/categories/with-products - Fetch all categories with their products and stock
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Get all categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('nom', { ascending: true })

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError)
      return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 })
    }

    // Get all purchase lines with category info
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

    // Get all sale lines with category info
    const { data: saleLines, error: saleError } = await supabase
      .from('lignes_vente')
      .select('produit_nom, quantite, category_id')

    if (saleError) {
      console.error('Error fetching sale lines:', saleError)
      return NextResponse.json({ error: 'Failed to fetch sales' }, { status: 500 })
    }

    // Calculate stock for each product by category
    const productMap = new Map()

    // Process purchases
    purchaseLines?.forEach((line: any) => {
      const key = `${line.produit_nom}_${line.category_id || 'uncategorized'}`
      if (!productMap.has(key)) {
        productMap.set(key, {
          produit_nom: line.produit_nom,
          category_id: line.category_id,
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
      const key = `${line.produit_nom}_${line.category_id || 'uncategorized'}`
      if (productMap.has(key)) {
        const product = productMap.get(key)
        product.quantite_vendue += line.quantite
      }
    })

    // Convert to array with calculated stock
    const allProducts = Array.from(productMap.values())
      .map((product: any) => ({
        ...product,
        quantite_disponible: product.quantite_achetee - product.quantite_vendue,
        is_low_stock: (product.quantite_achetee - product.quantite_vendue) <= LOW_STOCK_THRESHOLD
      }))

    // Group products by category
    const categoriesWithProducts = categories.map(category => {
      const categoryProducts = allProducts.filter(product => product.category_id === category.id)
      const lowStockCount = categoryProducts.filter(product => product.is_low_stock).length

      return {
        ...category,
        products: categoryProducts,
        total_products: categoryProducts.length,
        low_stock_count: lowStockCount
      }
    })

    // Add uncategorized products
    const uncategorizedProducts = allProducts.filter(product => product.category_id === null)
    if (uncategorizedProducts.length > 0) {
      const lowStockCount = uncategorizedProducts.filter(product => product.is_low_stock).length
      categoriesWithProducts.push({
        id: -1,
        nom: 'Sans catégorie',
        description: 'Produits sans catégorie assignée',
        couleur: '#6B7280',
        created_at: '',
        updated_at: '',
        products: uncategorizedProducts,
        total_products: uncategorizedProducts.length,
        low_stock_count: lowStockCount
      })
    }

    return NextResponse.json({ categories: categoriesWithProducts })
  } catch (error) {
    console.error('Error in categories with products endpoint:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}