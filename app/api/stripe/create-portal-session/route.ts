import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import { subscriptionService } from '@/lib/services/subscription-service'

export async function POST() {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const session = await subscriptionService.createPortalSession()
    return NextResponse.json(session)
  } catch (error) {
    console.error('Error creating portal session:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 