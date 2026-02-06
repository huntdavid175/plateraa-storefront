import { supabase } from './server'

// Order creation types
export type CreateOrderRequest = {
  institution_id: string
  branch_id: string
  customer_name: string
  customer_phone: string
  customer_email?: string | null
  delivery_address?: string | null
  delivery_type: 'delivery' | 'pickup' | 'dine_in'
  channel: 'phone' | 'website' | 'social' | 'bolt_food' | 'chowdeck' | 'glovo' | 'walk_in' | 'pos'
  subtotal: number
  delivery_fee: number
  total_amount: number
  payment_method?: 'cash' | 'card' | 'mobile_money' | 'bank_transfer' | null
  payment_status?: 'pending' | 'paid'
  paid_at?: string | null
  notes?: string | null
  status: 'pending' | 'paid' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
}

export type CreateOrderItemRequest = {
  order_id: string
  menu_item_id?: string | null
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  variant_name?: string | null
  notes?: string | null
}

export type CreateOrderItemAddonRequest = {
  order_item_id: string
  addon_name: string
  addon_price: number
  quantity: number
}

export type Order = {
  id: string
  institution_id: string
  branch_id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  delivery_address: string | null
  delivery_type: string
  channel: string
  subtotal: number
  delivery_fee: number
  total_amount: number
  payment_method: string | null
  payment_status?: string
  paid_at?: string | null
  notes: string | null
  status: string
  created_at: string
  updated_at: string
}

export type OrderItem = {
  id: string
  order_id: string
  menu_item_id: string | null
  item_name: string
  quantity: number
  unit_price: number
  total_price: number
  variant_name: string | null
  notes: string | null
}

export type OrderItemAddon = {
  id: string
  order_item_id: string
  addon_name: string
  addon_price: number
  quantity: number
}

// Create an order and return the order ID
export async function createOrder(orderData: CreateOrderRequest): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert([orderData])
    .select()
    .single()

  if (error) {
    console.error('Supabase error creating order:', JSON.stringify(error, null, 2))
    const errorCode = error.code ? ` (Code: ${error.code})` : ''
    const errorDetails = error.details ? ` Details: ${error.details}` : ''
    const errorHint = error.hint ? ` Hint: ${error.hint}` : ''
    throw new Error(`Failed to create order: ${error.message}${errorCode}${errorDetails}${errorHint}`)
  }

  if (!data) {
    throw new Error('Order creation returned no data')
  }

  return data as Order
}

// Create order items
export async function createOrderItems(items: CreateOrderItemRequest[]): Promise<OrderItem[]> {
  if (items.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('order_items')
    .insert(items)
    .select()

  if (error) {
    console.error('Supabase error creating order items:', JSON.stringify(error, null, 2))
    const errorCode = error.code ? ` (Code: ${error.code})` : ''
    const errorDetails = error.details ? ` Details: ${error.details}` : ''
    const errorHint = error.hint ? ` Hint: ${error.hint}` : ''
    throw new Error(`Failed to create order items: ${error.message}${errorCode}${errorDetails}${errorHint}`)
  }

  return (data || []) as OrderItem[]
}

// Create order item addons
export async function createOrderItemAddons(addons: CreateOrderItemAddonRequest[]): Promise<OrderItemAddon[]> {
  if (addons.length === 0) {
    return []
  }

  const { data, error } = await supabase
    .from('order_item_addons')
    .insert(addons)
    .select()

  if (error) {
    console.error('Supabase error creating order item addons:', JSON.stringify(error, null, 2))
    const errorCode = error.code ? ` (Code: ${error.code})` : ''
    const errorDetails = error.details ? ` Details: ${error.details}` : ''
    const errorHint = error.hint ? ` Hint: ${error.hint}` : ''
    throw new Error(`Failed to create order item addons: ${error.message}${errorCode}${errorDetails}${errorHint}`)
  }

  return (data || []) as OrderItemAddon[]
}

// Create a complete order with items and addons
export async function createCompleteOrder(
  orderData: CreateOrderRequest,
  items: Omit<CreateOrderItemRequest, 'order_id'>[],
  addonsMap: Map<string, Omit<CreateOrderItemAddonRequest, 'order_item_id'>[]>
): Promise<Order> {
  // Step 1: Create the order
  const order = await createOrder(orderData)

  // Step 2: Create order items with order_id
  const orderItems = await createOrderItems(
    items.map(item => ({
      ...item,
      order_id: order.id,
    }))
  )

  // Step 3: Create order item addons
  const allAddons: CreateOrderItemAddonRequest[] = []
  for (let i = 0; i < orderItems.length; i++) {
    const orderItem = orderItems[i]
    // Use index-based key to match the addonsMap from frontend
    const itemKey = `item-${i}`
    const itemAddons = addonsMap.get(itemKey) || []
    for (const addon of itemAddons) {
      allAddons.push({
        ...addon,
        order_item_id: orderItem.id,
      })
    }
  }

  if (allAddons.length > 0) {
    await createOrderItemAddons(allAddons)
  }

  return order
}

// Fetch order by ID
export async function getOrder(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .single()

  if (error) {
    console.error('Supabase error fetching order:', JSON.stringify(error, null, 2))
    if (error.code === 'PGRST116') {
      // No rows returned
      return null
    }
    const errorCode = error.code ? ` (Code: ${error.code})` : ''
    const errorDetails = error.details ? ` Details: ${error.details}` : ''
    const errorHint = error.hint ? ` Hint: ${error.hint}` : ''
    throw new Error(`Failed to fetch order: ${error.message}${errorCode}${errorDetails}${errorHint}`)
  }

  return data as Order | null
}
