import Image from "next/image"

interface QuoteHeaderProps {
  businessName: string
  businessLogo?: string
  quoteNumber: string
  quoteDate: string
  expiryDate: string
}

export function QuoteHeader({ businessName, businessLogo, quoteNumber, quoteDate, expiryDate }: QuoteHeaderProps) {
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
          <h2 className="text-2xl font-bold text-primary">QUOTE</h2>
          <p className="text-muted-foreground"># {quoteNumber}</p>
        </div>
      </div>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-muted-foreground">Quote Date</p>
          <p className="font-medium">{quoteDate}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Expiry Date</p>
          <p className="font-medium">{expiryDate}</p>
        </div>
      </div>
    </div>
  )
}
