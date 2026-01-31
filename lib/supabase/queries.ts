import { supabase } from './server'

// Database types
export type Institution = {
  id: string
  name: string
  slug: string
  email: string
  phone: string
  created_at: string
  updated_at: string
}

export type MenuCategory = {
  id: string
  institution_id: string
  name: string
  icon: string
  is_visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export type MenuItemVariant = {
  id: string
  menu_item_id: string
  name: string
  price: number
  sort_order: number
  is_default: boolean
  created_at: string
}

export type MenuItemAddon = {
  id: string
  menu_item_id: string
  name: string
  price: number
  sort_order: number
  is_available: boolean
  created_at: string
}

export type MenuTag = {
  id: string
  name: string
}

export type Branch = {
  id: string
  institution_id: string
  name: string
  address: string
  phone: string | null
  created_at: string
  updated_at: string
}

export type MenuItem = {
  id: string
  institution_id: string
  category_id: string
  name: string
  description: string
  price: number
  image_url: string | null
  preparation_time: number
  is_available: boolean
  is_featured: boolean
  is_unlimited_stock: boolean
  stock_quantity: number | null
  created_at: string
  updated_at: string
  menu_categories?: {
    id: string
    name: string
    icon: string
  }
  menu_item_variants?: MenuItemVariant[]
  menu_item_addons?: MenuItemAddon[]
  menu_item_tags?: Array<{
    menu_tags: MenuTag
  }>
}

// Fetch institution by ID
export async function getInstitution(institutionId: string) {
  const { data, error } = await supabase
    .from('institutions')
    .select('*')
    .eq('id', institutionId)
    .single()

  if (error) {
    console.error('Supabase error details:', JSON.stringify(error, null, 2));
    const errorCode = error.code ? ` (Code: ${error.code})` : '';
    const errorDetails = error.details ? ` Details: ${error.details}` : '';
    const errorHint = error.hint ? ` Hint: ${error.hint}` : '';
    throw new Error(`Failed to fetch institution: ${error.message}${errorCode}${errorDetails}${errorHint}`)
  }

  if (!data) {
    throw new Error(`Institution with ID ${institutionId} not found`)
  }

  return data as Institution
}

// Fetch menu categories for an institution
export async function getMenuCategories(institutionId: string) {
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('institution_id', institutionId)
    .eq('is_visible', true)
    .order('sort_order')

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch categories: ${error.message} (Code: ${error.code})`)
  }

  return (data || []) as MenuCategory[]
}

// Fetch menu items with all related data
export async function getMenuItems(institutionId: string) {
  const { data, error } = await supabase
    .from('menu_items')
    .select(`
      *,
      menu_categories (id, name, icon),
      menu_item_variants (id, name, price, sort_order, is_default),
      menu_item_addons (id, name, price, sort_order, is_available),
      menu_item_tags (
        menu_tags (id, name)
      )
    `)
    .eq('institution_id', institutionId)
    .eq('is_available', true)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Supabase error:', error);
    throw new Error(`Failed to fetch menu items: ${error.message} (Code: ${error.code})`)
  }

  return (data || []) as MenuItem[]
}

// Fetch branches for an institution
export async function getBranches(institutionId: string) {
  console.log(`[getBranches] Querying branches for institution_id: ${institutionId} (type: ${typeof institutionId})`);
  
  const { data, error } = await supabase
    .from('branches')
    .select('*')
    .eq('institution_id', institutionId)
    .order('name')

  if (error) {
    console.error('[getBranches] Supabase error details:', JSON.stringify(error, null, 2));
    const errorCode = error.code ? ` (Code: ${error.code})` : '';
    const errorDetails = error.details ? ` Details: ${error.details}` : '';
    const errorHint = error.hint ? ` Hint: ${error.hint}` : '';
    throw new Error(`Failed to fetch branches: ${error.message}${errorCode}${errorDetails}${errorHint}`)
  }

  console.log(`[getBranches] Query result: Found ${data?.length || 0} branches`);
  if (data && data.length > 0) {
    console.log(`[getBranches] Sample branch data:`, JSON.stringify(data[0], null, 2));
  } else {
    // Try a broader query to see if any branches exist at all
    const { data: allBranches } = await supabase
      .from('branches')
      .select('id, institution_id, name')
      .limit(5);
    console.log(`[getBranches] Debug: Found ${allBranches?.length || 0} total branches in database`);
    if (allBranches && allBranches.length > 0) {
      console.log(`[getBranches] Sample branches in DB:`, JSON.stringify(allBranches, null, 2));
      console.log(`[getBranches] Looking for institution_id: "${institutionId}"`);
      console.log(`[getBranches] Available institution_ids:`, allBranches.map(b => `"${b.institution_id}"`).join(', '));
    }
  }
  
  return (data || []) as Branch[]
}
