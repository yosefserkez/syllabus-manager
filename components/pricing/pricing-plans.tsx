"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const plans = [
  {
    name: "Monthly",
    description: "Perfect for short-term use",
    price: 9.99,
    interval: "month",
    priceId: "price_monthly",
    features: [
      "Unlimited courses",
      "Unlimited tasks",
      "Email notifications",
      "Priority support",
    ],
  },
  {
    name: "Annual",
    description: "Save 20% with yearly billing",
    price: 95.90,
    interval: "year",
    priceId: "price_yearly",
    features: [
      "All Monthly Plan features",
      "20% discount",
      "Advanced analytics",
      "API access",
    ],
    popular: true,
  },
  {
    name: "4-Year",
    description: "Best value for long-term students",
    price: 339.00,
    interval: "4 years",
    priceId: "price_four_yearly",
    features: [
      "All Annual Plan features",
      "30% discount",
      "Custom integrations",
      "Dedicated support",
    ],
  },
];

export function PricingPlans() {
  const [loading, setLoading] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  const handleSubscribe = async (priceId: string) => {
    if (!user) {
      router.push("/auth");
      return;
    }

    try {
      setLoading(priceId);
      const response = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await stripePromise;
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto px-4">
      {plans.map((plan) => (
        <Card
          key={plan.priceId}
          className={`relative p-8 ${
            plan.popular ? "border-primary shadow-lg" : ""
          }`}
        >
          {plan.popular && (
            <Badge
              className="absolute top-0 right-6 -translate-y-1/2"
              variant="default"
            >
              Most Popular
            </Badge>
          )}
          <div className="mb-8">
            <h3 className="text-2xl font-bold">{plan.name}</h3>
            <p className="text-muted-foreground mt-2">{plan.description}</p>
            <div className="mt-4">
              <span className="text-4xl font-bold">${plan.price}</span>
              <span className="text-muted-foreground">/{plan.interval}</span>
            </div>
          </div>

          <Button
            className="w-full mb-8"
            onClick={() => handleSubscribe(plan.priceId)}
            disabled={loading === plan.priceId}
          >
            {loading === plan.priceId ? "Loading..." : "Subscribe"}
          </Button>

          <ul className="space-y-3">
            {plan.features.map((feature) => (
              <li key={feature} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </Card>
      ))}
    </div>
  );
}