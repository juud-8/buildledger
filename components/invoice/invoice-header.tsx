import Image from "next/image"

interface InvoiceHeaderProps {
  businessName: string
  businessLogo?: string
  invoiceNumber: string
  invoiceDate: string
  dueDate: string
}

export function InvoiceHeader({ businessName, businessLogo, invoiceNumber, invoiceDate, dueDate }: InvoiceHeaderProps) {
  return (
    <div className="flex flex-col gap-6 pb-6 border-b">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          {businessLogo ? (
            <div className="h-12 w-12 relative">
              <Image
                src={businessLogo || "/buildledger-logo.png"}
                alt={`${businessName} logo`}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <div className="h-12 w-12 relative">
              <Image src="/buildledger-logo.png" alt="BuildLedger logo" fill className="object-contain" />
            </div>
          )}
          <h1 className="text-2xl font-bold">{businessName}</h1>
        </div>
        <div className="text-right">
          <h2 className="text-2xl font-bold text-primary">INVOICE</h2>
          <p className="text-muted-foreground"># {invoiceNumber}</p>
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">Invoice Date</p>
          <p className="font-medium">{invoiceDate}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Due Date</p>
          <p className="font-medium">{dueDate}</p>
        </div>
      </div>
    </div>
  )
}
