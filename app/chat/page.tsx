import { AIChatbot } from "@/components/ai-chatbot"

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">AI Assistant</h1>
        <p className="text-muted-foreground">Chat with our AI assistant to get help with invoices, quotes, and more.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <AIChatbot />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <h3 className="font-medium mb-2">Suggested Questions</h3>
            <ul className="space-y-2">
              <li className="text-sm text-primary hover:underline cursor-pointer">How do I create a new invoice?</li>
              <li className="text-sm text-primary hover:underline cursor-pointer">
                What's the difference between quotes and invoices?
              </li>
              <li className="text-sm text-primary hover:underline cursor-pointer">How can I track overdue payments?</li>
              <li className="text-sm text-primary hover:underline cursor-pointer">
                Can I customize my invoice templates?
              </li>
              <li className="text-sm text-primary hover:underline cursor-pointer">
                How do I export my financial data?
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-border/50 bg-card p-4">
            <h3 className="font-medium mb-2">Recent Conversations</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <p className="text-primary hover:underline cursor-pointer">Invoice creation help</p>
                <p className="text-xs text-muted-foreground">Yesterday at 2:30 PM</p>
              </div>
              <div className="text-sm">
                <p className="text-primary hover:underline cursor-pointer">Payment tracking questions</p>
                <p className="text-xs text-muted-foreground">Apr 18, 2024</p>
              </div>
              <div className="text-sm">
                <p className="text-primary hover:underline cursor-pointer">Client management tips</p>
                <p className="text-xs text-muted-foreground">Apr 15, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
