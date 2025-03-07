import { Header } from "@/components/header";
import { PricingPlans } from "@/components/pricing/pricing-plans";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Choose the plan that best fits your needs. All plans include a 14-day free trial.
          </p>
        </div>
        <PricingPlans />
      </div>
    </div>
  );
}