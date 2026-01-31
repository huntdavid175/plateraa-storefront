# Restaurant Data Fetching Schema

This document describes how to fetch restaurant information, menu items, categories, addons, variants, and related data for the frontend.

## **Table Structure Overview**

### **1. Institutions Table (`institutions`)**
- `id` (UUID) - Primary key
- `name` (TEXT) - Institution/restaurant name
- `slug` (TEXT) - URL-friendly identifier
- `email` (TEXT) - Contact email
- `phone` (TEXT) - Contact phone
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### **2. Branches Table (`branches`)**
- `id` (UUID) - Primary key
- `institution_id` (UUID) - Foreign key to `institutions`
- `name` (TEXT) - Branch name
- `address` (TEXT) - Branch address
- `phone` (TEXT) - Branch phone (optional)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### **3. Menu Categories Table (`menu_categories`)**
- `id` (UUID) - Primary key
- `institution_id` (UUID) - Foreign key to `institutions`
- `name` (TEXT) - Category name
- `icon` (TEXT) - Emoji or icon identifier
- `is_visible` (BOOLEAN) - Whether category is visible
- `sort_order` (INTEGER) - Display order
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### **4. Menu Items Table (`menu_items`)**
- `id` (UUID) - Primary key
- `institution_id` (UUID) - Foreign key to `institutions`
- `category_id` (UUID) - Foreign key to `menu_categories`
- `name` (TEXT) - Item name
- `description` (TEXT) - Item description
- `price` (NUMERIC/DECIMAL) - Base price
- `image_url` (TEXT) - Image URL
- `preparation_time` (INTEGER) - Minutes to prepare
- `is_available` (BOOLEAN) - Whether item is available
- `is_featured` (BOOLEAN) - Whether item is featured
- `is_unlimited_stock` (BOOLEAN) - Whether stock is unlimited
- `stock_quantity` (INTEGER) - Stock quantity (null if unlimited)
- `created_at` (TIMESTAMPTZ)
- `updated_at` (TIMESTAMPTZ)

### **5. Menu Item Variants Table (`menu_item_variants`)**
- `id` (UUID) - Primary key
- `menu_item_id` (UUID) - Foreign key to `menu_items`
- `name` (TEXT) - Variant name (e.g., "Regular", "Large", "Full")
- `price` (NUMERIC/DECIMAL) - Price for this variant
- `sort_order` (INTEGER) - Display order
- `is_default` (BOOLEAN) - Whether this is the default variant
- `created_at` (TIMESTAMPTZ)

### **6. Menu Item Addons Table (`menu_item_addons`)**
- `id` (UUID) - Primary key
- `menu_item_id` (UUID) - Foreign key to `menu_items`
- `name` (TEXT) - Addon name
- `price` (NUMERIC/DECIMAL) - Addon price
- `sort_order` (INTEGER) - Display order
- `is_available` (BOOLEAN) - Whether addon is available
- `created_at` (TIMESTAMPTZ)

### **7. Menu Tags Table (`menu_tags`)**
- `id` (UUID) - Primary key
- `institution_id` (UUID) - Foreign key to `institutions`
- `name` (TEXT) - Tag name
- `created_at` (TIMESTAMPTZ)

### **8. Menu Item Tags Junction Table (`menu_item_tags`)**
- `id` (UUID) - Primary key
- `menu_item_id` (UUID) - Foreign key to `menu_items`
- `menu_tag_id` (UUID) - Foreign key to `menu_tags`
- `created_at` (TIMESTAMPTZ)

---

## **Query Examples**

### **1. Fetch Restaurant/Institution Information**

```typescript
// Get institution details
const { data: institution, error } = await supabase
  .from("institutions")
  .select("*")
  .eq("id", institutionId)
  .single();
```

**Response:**
```json
{
  "id": "uuid",
  "name": "Restaurant Name",
  "slug": "restaurant-slug",
  "email": "contact@restaurant.com",
  "phone": "+1234567890",
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

---

### **2. Fetch Branches for an Institution**

```typescript
// Get all branches for an institution
const { data: branches, error } = await supabase
  .from("branches")
  .select("id, name, address, phone")
  .eq("institution_id", institutionId)
  .order("name");
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Main Branch",
    "address": "123 Main St",
    "phone": "+1234567890"
  }
]
```

---

### **3. Fetch Menu Categories**

```typescript
// Get all categories for an institution
const { data: categories, error } = await supabase
  .from("menu_categories")
  .select("*")
  .eq("institution_id", institutionId)
  .eq("is_visible", true) // Only visible categories
  .order("sort_order");
```

**Response:**
```json
[
  {
    "id": "uuid",
    "institution_id": "uuid",
    "name": "Main Dishes",
    "icon": "🍽️",
    "is_visible": true,
    "sort_order": 1,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

---

### **4. Fetch Menu Items with Variants, Addons, and Category (Complete Query)**

This is the **main query** you'll use to fetch the full menu:

```typescript
// Fetch all menu items with related data
const { data: menuItems, error } = await supabase
  .from("menu_items")
  .select(`
    *,
    menu_categories (id, name, icon),
    menu_item_variants (id, name, price, sort_order, is_default),
    menu_item_addons (id, name, price, sort_order, is_available),
    menu_item_tags (
      menu_tags (id, name)
    )
  `)
  .eq("institution_id", institutionId)
  .eq("is_available", true) // Only available items
  .order("created_at", { ascending: true });
```

**Response Structure:**
```json
[
  {
    "id": "uuid",
    "institution_id": "uuid",
    "category_id": "uuid",
    "name": "Jollof Rice",
    "description": "Delicious Nigerian jollof rice",
    "price": 2000,
    "image_url": "https://...",
    "preparation_time": 20,
    "is_available": true,
    "is_featured": false,
    "is_unlimited_stock": true,
    "stock_quantity": null,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z",
    "menu_categories": {
      "id": "uuid",
      "name": "Main Dishes",
      "icon": "🍽️"
    },
    "menu_item_variants": [
      {
        "id": "uuid",
        "name": "Regular",
        "price": 2000,
        "sort_order": 1,
        "is_default": true
      },
      {
        "id": "uuid",
        "name": "Large",
        "price": 3000,
        "sort_order": 2,
        "is_default": false
      }
    ],
    "menu_item_addons": [
      {
        "id": "uuid",
        "name": "Extra Chicken",
        "price": 500,
        "sort_order": 1,
        "is_available": true
      },
      {
        "id": "uuid",
        "name": "Extra Plantain",
        "price": 300,
        "sort_order": 2,
        "is_available": true
      }
    ],
    "menu_item_tags": [
      {
        "menu_tags": {
          "id": "uuid",
          "name": "Spicy"
        }
      }
    ]
  }
]
```

---

### **5. Fetch Menu Items Filtered by Category**

```typescript
// Get menu items for a specific category
const { data: menuItems, error } = await supabase
  .from("menu_items")
  .select(`
    *,
    menu_categories (name),
    menu_item_variants (name, price, sort_order),
    menu_item_addons (name, price, sort_order)
  `)
  .eq("institution_id", institutionId)
  .eq("category_id", categoryId)
  .eq("is_available", true)
  .order("name");
```

---

### **6. Fetch Only Available Menu Items (Simplified for POS/Order Creation)**

```typescript
// Simplified query for order creation (no tags)
const { data: menuItems, error } = await supabase
  .from("menu_items")
  .select(`
    id,
    name,
    price,
    is_available,
    menu_categories (name),
    menu_item_variants (name, price, sort_order),
    menu_item_addons (name, price, sort_order)
  `)
  .eq("institution_id", institutionId)
  .eq("is_available", true)
  .order("name");
```

**Response:**
```json
[
  {
    "id": "uuid",
    "name": "Jollof Rice",
    "price": 2000,
    "is_available": true,
    "menu_categories": {
      "name": "Main Dishes"
    },
    "menu_item_variants": [
      {
        "name": "Regular",
        "price": 2000,
        "sort_order": 1
      },
      {
        "name": "Large",
        "price": 3000,
        "sort_order": 2
      }
    ],
    "menu_item_addons": [
      {
        "name": "Extra Chicken",
        "price": 500,
        "sort_order": 1
      }
    ]
  }
]
```

---

### **7. Fetch Featured Menu Items**

```typescript
// Get featured items
const { data: featuredItems, error } = await supabase
  .from("menu_items")
  .select(`
    *,
    menu_categories (name),
    menu_item_variants (name, price, sort_order),
    menu_item_addons (name, price, sort_order)
  `)
  .eq("institution_id", institutionId)
  .eq("is_available", true)
  .eq("is_featured", true)
  .order("created_at", { ascending: false });
```

---

### **8. Fetch Menu Items with Stock Information**

```typescript
// Get items with stock tracking
const { data: menuItems, error } = await supabase
  .from("menu_items")
  .select(`
    id,
    name,
    price,
    is_unlimited_stock,
    stock_quantity,
    is_available
  `)
  .eq("institution_id", institutionId)
  .eq("is_available", true);
```

---

## **TypeScript Interface Examples**

```typescript
// Menu Item Interface
interface MenuItem {
  id: string;
  institution_id: string;
  category_id: string;
  name: string;
  description: string;
  price: number;
  image_url?: string | null;
  preparation_time: number;
  is_available: boolean;
  is_featured: boolean;
  is_unlimited_stock: boolean;
  stock_quantity?: number | null;
  created_at: string;
  updated_at: string;
  menu_categories?: {
    id: string;
    name: string;
    icon: string;
  };
  menu_item_variants?: Array<{
    id: string;
    name: string;
    price: number;
    sort_order: number;
    is_default: boolean;
  }>;
  menu_item_addons?: Array<{
    id: string;
    name: string;
    price: number;
    sort_order: number;
    is_available: boolean;
  }>;
  menu_item_tags?: Array<{
    menu_tags: {
      id: string;
      name: string;
    };
  }>;
}

// Category Interface
interface MenuCategory {
  id: string;
  institution_id: string;
  name: string;
  icon: string;
  is_visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Institution Interface
interface Institution {
  id: string;
  name: string;
  slug: string;
  email: string;
  phone: string;
  created_at: string;
  updated_at: string;
}

// Branch Interface
interface Branch {
  id: string;
  institution_id: string;
  name: string;
  address: string;
  phone?: string | null;
  created_at: string;
  updated_at: string;
}
```

---

## **Complete Frontend Data Fetching Flow**

### **Step 1: Get User's Institution ID**

```typescript
// Get current user's institution
const { data: { user } } = await supabase.auth.getUser();
const { data: userData } = await supabase
  .from("users")
  .select("institution_id, branch_id")
  .eq("auth_id", user.id)
  .single();

const institutionId = userData.institution_id;
```

### **Step 2: Fetch Restaurant Information**

```typescript
// Fetch institution details
const { data: institution } = await supabase
  .from("institutions")
  .select("*")
  .eq("id", institutionId)
  .single();
```

### **Step 3: Fetch Branches**

```typescript
// Fetch branches
const { data: branches } = await supabase
  .from("branches")
  .select("id, name, address")
  .eq("institution_id", institutionId)
  .order("name");
```

### **Step 4: Fetch Menu Categories**

```typescript
// Fetch categories
const { data: categories } = await supabase
  .from("menu_categories")
  .select("*")
  .eq("institution_id", institutionId)
  .eq("is_visible", true)
  .order("sort_order");
```

### **Step 5: Fetch Menu Items (Complete)**

```typescript
// Fetch menu items with all related data
const { data: menuItems } = await supabase
  .from("menu_items")
  .select(`
    *,
    menu_categories (id, name, icon),
    menu_item_variants (id, name, price, sort_order, is_default),
    menu_item_addons (id, name, price, sort_order, is_available),
    menu_item_tags (
      menu_tags (id, name)
    )
  `)
  .eq("institution_id", institutionId)
  .eq("is_available", true)
  .order("created_at", { ascending: true });
```

---

## **Important Notes**

1. **Filtering by Institution**: Always filter by `institution_id` to ensure data isolation between different restaurants.

2. **Available Items Only**: Use `.eq("is_available", true)` to only fetch items that can be ordered.

3. **Stock Management**: Check `is_unlimited_stock` and `stock_quantity` before allowing orders.

4. **Variants Sorting**: Variants are returned with `sort_order` - sort them before displaying.

5. **Addons Sorting**: Addons are returned with `sort_order` - sort them before displaying.

6. **Category Relationship**: The `menu_categories` relationship can return an object or array depending on the query - handle both cases.

7. **Nested Queries**: Supabase supports nested queries using the `(field)` syntax for related tables.

8. **Performance**: For large menus, consider pagination or fetching categories and items separately.

---

## **Common Use Cases**

### **POS System - Quick Menu Fetch**
```typescript
// Minimal data for fast loading
const { data } = await supabase
  .from("menu_items")
  .select(`
    id, name, price, is_available,
    menu_categories (name),
    menu_item_variants (name, price),
    menu_item_addons (name, price)
  `)
  .eq("institution_id", institutionId)
  .eq("is_available", true);
```

### **Customer-Facing Menu - Full Details**
```typescript
// Full details with images and descriptions
const { data } = await supabase
  .from("menu_items")
  .select(`
    *,
    menu_categories (name, icon),
    menu_item_variants (name, price, sort_order),
    menu_item_addons (name, price, sort_order)
  `)
  .eq("institution_id", institutionId)
  .eq("is_available", true)
  .eq("is_featured", true) // Optional: only featured items
  .order("is_featured", { ascending: false })
  .order("name");
```

### **Admin Dashboard - All Items**
```typescript
// All items including unavailable ones
const { data } = await supabase
  .from("menu_items")
  .select(`
    *,
    menu_categories (name),
    menu_item_variants (name, price),
    menu_item_addons (name, price)
  `)
  .eq("institution_id", institutionId)
  .order("created_at", { ascending: false });
```

---

## **Reference Implementation**

See the following files for working examples:
- `app/dashboard/menu/page.tsx` (lines 727-820) - Full menu fetching
- `app/dashboard/orders/page.tsx` (lines 600-670) - Simplified menu for order creation
