const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!;

export interface PaystackPlan {
  id: string;
  name: string;
  amount: number;
  interval: "monthly" | "annually";
}

export async function initializePayment(
  email: string,
  amount: number,
  reference: string,
  metadata?: any
) {
  const response = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: amount * 100, // Convert to kobo
      reference,
      metadata,
      callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription/callback`,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to initialize payment");
  }

  return response.json();
}

export async function verifyPayment(reference: string) {
  const response = await fetch(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to verify payment");
  }

  return response.json();
}

export function getPlanAmount(plan: "monthly" | "yearly"): number {
  if (plan === "monthly") return 2999; // N2,999
  return 29999; // N29,999
}

