"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Check, Loader2 } from "lucide-react";

type Subscription = {
  status: string;
  current_period_end: string;
  plan: {
    name: string;
    price: number;
    interval: string;
    features: string[];
  };
};

export function SubscriptionSettings() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const response = await fetch('/api/subscriptions/current');
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Card className="p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium mb-2">No Active Subscription</h3>
          <p className="text-muted-foreground mb-4">
            Choose a plan to unlock all features
          </p>
          <Button onClick={() => router.push('/pricing')}>View Plans</Button>
        </div>
      </Card>
    );
  }

  const endDate = new Date(subscription.current_period_end);

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium">{subscription.plan.name}</h3>
          <p className="text-muted-foreground">
            ${subscription.plan.price}/{subscription.plan.interval}
          </p>
        </div>
        <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'}>
          {subscription.status === 'active' ? 'Active' : 'Inactive'}
        </Badge>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">
            Next billing date: {endDate.toLocaleDateString()}
          </p>
        </div>

        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Plan Features</h4>
          <ul className="space-y-2">
            {subscription.plan.features.map((feature) => (
              <li key={feature} className="flex items-center text-sm">
                <Check className="h-4 w-4 mr-2 text-green-500" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push('/pricing')}
          >
            Change Plan
          </Button>
          <Button
            variant="destructive"
            className="w-full"
            onClick={() => router.push('/dashboard/settings/billing')}
          >
            Cancel Subscription
          </Button>
        </div>
      </div>
    </Card>
  );
}