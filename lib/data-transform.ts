import type { MenuItem, MenuCategory } from './supabase/queries'

// Frontend types
export type FrontendMenuItem = {
  id: string
  category: string
  categoryId: string
  name: string
  description: string
  price: number
  image: string | null
  isPopular?: boolean
  dietaryTags: string[]
  modificationGroups?: Array<{
    id: string
    name: string
    required: boolean
    minSelect: number
    maxSelect: number
    options: Array<{
      id: string
      name: string
      price: number
    }>
  }>
}

export type FrontendCategory = {
  id: string
  name: string
}

export type FrontendRestaurant = {
  id: string
  name: string
  tagline?: string
  rating?: number
  reviewCount?: number
  deliveryTime?: string
  deliveryFee: number
  minOrder: number
  cuisine?: string
  isOpen: boolean
  coverImage?: string
}

// Transform Supabase menu items to frontend format
export function transformMenuItems(
  items: MenuItem[],
  categories: MenuCategory[]
): FrontendMenuItem[] {
  // Create a map of category IDs to category names for quick lookup
  const categoryMap = new Map(categories.map(cat => [cat.id, cat.name]))

  return items.map(item => {
    // Get dietary tags from menu_item_tags
    const dietaryTags: string[] = []
    if (item.menu_item_tags) {
      item.menu_item_tags.forEach(tagRelation => {
        const tagName = tagRelation.menu_tags?.name?.toLowerCase() || ''
        if (tagName === 'vegetarian' || tagName === 'vegan' || tagName === 'gluten-free') {
          dietaryTags.push(tagName)
        }
      })
    }

    // Build modification groups from variants and addons
    const modificationGroups: FrontendMenuItem['modificationGroups'] = []

    // Variants become a required selection group (e.g., size)
    // If item has variants, use the default variant price as base, or first variant
    let displayPrice = Number(item.price)
    if (item.menu_item_variants && item.menu_item_variants.length > 0) {
      const sortedVariants = [...item.menu_item_variants].sort((a, b) => a.sort_order - b.sort_order)
      const defaultVariant = sortedVariants.find(v => v.is_default) || sortedVariants[0]
      if (defaultVariant) {
        displayPrice = Number(defaultVariant.price)
      }
      
      modificationGroups.push({
        id: 'variant',
        name: 'Choose size',
        required: true,
        minSelect: 1,
        maxSelect: 1,
        options: sortedVariants.map(variant => ({
          id: variant.id,
          name: variant.name,
          price: Number(variant.price) - displayPrice, // Price difference from default/base
        })),
      })
    }

    // Addons become an optional selection group
    if (item.menu_item_addons && item.menu_item_addons.length > 0) {
      const sortedAddons = [...item.menu_item_addons]
        .filter(addon => addon.is_available)
        .sort((a, b) => a.sort_order - b.sort_order)

      if (sortedAddons.length > 0) {
        modificationGroups.push({
          id: 'addons',
          name: 'Add extras',
          required: false,
          minSelect: 0,
          maxSelect: sortedAddons.length,
          options: sortedAddons.map(addon => ({
            id: addon.id,
            name: addon.name,
            price: Number(addon.price),
          })),
        })
      }
    }

    // Get category name
    const categoryName = categoryMap.get(item.category_id) || 'Other'
    const categoryId = item.category_id

    return {
      id: item.id,
      category: categoryName,
      categoryId,
      name: item.name,
      description: item.description || '',
      price: displayPrice, // Use calculated display price (with variant consideration)
      image: item.image_url,
      isPopular: item.is_featured,
      dietaryTags,
      modificationGroups: modificationGroups.length > 0 ? modificationGroups : undefined,
    }
  })
}

// Transform categories to frontend format
export function transformCategories(categories: MenuCategory[]): FrontendCategory[] {
  return categories
    .filter(cat => cat.is_visible)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(cat => ({
      id: cat.id,
      name: cat.name,
    }))
}
