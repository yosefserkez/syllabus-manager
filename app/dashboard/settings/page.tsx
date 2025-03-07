"use client";

import { NotificationSettings } from "@/components/notification-settings";
import { SubscriptionSettings } from "@/components/subscription-settings";

export default function SettingsPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-2xl space-y-8">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Subscription</h2>
            <SubscriptionSettings />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>
            <NotificationSettings />
          </div>
        </div>
      </div>
    </div>
  );
}