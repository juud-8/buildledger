import { Suspense } from 'react'
import NewInvoiceClient from './NewInvoiceClient'

export default function NewInvoicePage() {
  return (
    <Suspense>
      <NewInvoiceClient />
    </Suspense>
  )
}
