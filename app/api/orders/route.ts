import { NextRequest, NextResponse } from 'next/server'
import { createCompleteOrder } from '@/lib/supabase/orders'
import type { CreateOrderRequest, CreateOrderItemRequest, CreateOrderItemAddonRequest } from '@/lib/supabase/orders'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      order,
      items,
      addonsMap,
    }: {
      order: CreateOrderRequest
      items: Omit<CreateOrderItemRequest, 'order_id'>[]
      addonsMap: Record<string, Omit<CreateOrderItemAddonRequest, 'order_item_id'>[]>
    } = body

    // Convert addonsMap from object to Map
    const addonsMapConverted = new Map<string, Omit<CreateOrderItemAddonRequest, 'order_item_id'>[]>()
    Object.entries(addonsMap).forEach(([key, value]) => {
      addonsMapConverted.set(key, value)
    })

    const createdOrder = await createCompleteOrder(order, items, addonsMapConverted)

    return NextResponse.json(
      {
        success: true,
        order: createdOrder,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create order',
      },
      { status: 500 }
    )
  }
}
