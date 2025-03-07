"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export function DemoBanner() {
  const router = useRouter();

  return (
    <Alert className="rounded-none border-x-0 border-t-0">
      <AlertDescription className="flex items-center justify-between">
        <span>
          You're viewing a demo version. Create an account to unlock all features.
        </span>
        <Button variant="outline" onClick={() => router.push("/auth")}>
          Sign Up Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}