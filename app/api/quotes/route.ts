import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Quote } from '@/types/database'
import { quoteService } from '@/lib/services/quote-service'

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const quotes = await quoteService.getQuotes(user.id)
    return NextResponse.json(quotes)
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const quote: Partial<Quote> = {
      ...body,
      user_id: user.id,
      public_token: crypto.randomUUID(),
    }

    const newQuote = await quoteService.createQuote(quote)
    
    if (body.items && Array.isArray(body.items)) {
      await quoteService.addQuoteItems(
        body.items.map((item: any) => ({
          ...item,
          quote_id: newQuote.id
        }))
      )
    }

    return NextResponse.json(newQuote, { status: 201 })
  } catch (error) {
    console.error('Error creating quote:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 