import { NotificationList } from "@/components/notification-list"

export default function NotificationsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with important alerts and information.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <NotificationList />
        </div>
        <div className="space-y-6">
          <div className="rounded-lg border border-border/50 bg-card p-4">
            <h3 className="font-medium mb-2">Notification Settings</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Configure which notifications you want to receive and how you want to receive them.
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Email notifications</span>
                <div className="h-5 w-10 bg-primary rounded-full relative">
                  <div className="h-4 w-4 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Push notifications</span>
                <div className="h-5 w-10 bg-primary rounded-full relative">
                  <div className="h-4 w-4 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Payment alerts</span>
                <div className="h-5 w-10 bg-primary rounded-full relative">
                  <div className="h-4 w-4 bg-white rounded-full absolute top-0.5 right-0.5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
