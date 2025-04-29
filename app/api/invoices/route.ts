import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase/server'
import type { Invoice } from '@/types/database'
import { invoiceService } from '@/lib/services/invoice-service'

export async function GET() {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: invoices, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching invoices:', error)
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }

    return NextResponse.json(invoices)
  } catch (error) {
    console.error('Error in invoices route:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = supabaseServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const invoice: Partial<Invoice> = {
      ...body,
      user_id: user.id,
      public_token: crypto.randomUUID(),
    }

    const newInvoice = await invoiceService.createInvoice(invoice)
    
    if (body.items && Array.isArray(body.items)) {
      await invoiceService.addInvoiceItems(
        body.items.map((item: any) => ({
          ...item,
          invoice_id: newInvoice.id
        }))
      )
    }

    return NextResponse.json(newInvoice, { status: 201 })
  } catch (error) {
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 