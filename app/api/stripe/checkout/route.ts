import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/services/subscription-service'

export async function POST(request: Request) {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { priceId } = await request.json()
    if (!priceId) {
      return NextResponse.json({ error: 'Price ID is required' }, { status: 400 })
    }

    const session = await subscriptionService.createCheckoutSession(priceId)
    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 