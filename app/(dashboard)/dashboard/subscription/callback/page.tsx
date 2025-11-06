"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, XCircle } from "lucide-react";

export default function SubscriptionCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const reference = searchParams.get("reference");

  useEffect(() => {
    if (!reference) {
      setStatus("error");
      return;
    }

    const verifyPayment = async () => {
      try {
        const response = await fetch("/api/paystack/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reference }),
        });

        if (response.ok) {
          setStatus("success");
          setTimeout(() => {
            router.push("/dashboard/subscription");
          }, 3000);
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };

    verifyPayment();
  }, [reference, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="p-8 text-center">
          {status === "loading" && (
            <>
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-lg font-semibold">Verifying payment...</p>
            </>
          )}
          {status === "success" && (
            <>
              <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Payment Successful!</p>
              <p className="text-muted-foreground">
                Your subscription has been activated. Redirecting...
              </p>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Payment Failed</p>
              <p className="text-muted-foreground mb-4">
                There was an issue processing your payment. Please try again.
              </p>
              <button
                onClick={() => router.push("/dashboard/subscription")}
                className="text-primary hover:underline"
              >
                Go back to subscription page
              </button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

