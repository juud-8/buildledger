import { describe, it, expect, vi } from 'vitest'
import { GET } from '../app/api/invoices/route'

vi.mock('../lib/supabase/server', () => ({
  supabaseServer: () => ({
    auth: {
      getUser: async () => ({ data: { user: { id: 'user-1' } } })
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          order: () => ({ data: [{ id: 1, user_id: 'user-1' }], error: null })
        })
      })
    })
  })
}))

describe('GET /api/invoices', () => {
  it('returns invoices for the authenticated user', async () => {
    const response = await GET()
    const data = await response.json()
    expect(response.status).toBe(200)
    expect(data.every((inv: any) => inv.user_id === 'user-1')).toBe(true)
  })
})
