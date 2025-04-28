import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'

type Table = 'invoices' | 'quotes' | 'library_items'

export function useRealtimeSubscription(
  table: Table,
  onUpdate: () => void
) {
  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      channel = supabase
        .channel(`${table}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table
          },
          () => {
            onUpdate()
          }
        )
        .subscribe()
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, onUpdate])
} 