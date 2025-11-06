import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { verifyPayment } from "@/lib/paystack/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    const verification = await verifyPayment(reference);

    if (verification.data.status !== "success") {
      return NextResponse.json(
        { error: "Payment not successful" },
        { status: 400 }
      );
    }

    const { user_id, plan } = verification.data.metadata;

    // Update subscription in database
    const expiresAt = new Date();
    if (plan === "monthly") {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    } else {
      expiresAt.setFullYear(expiresAt.getFullYear() + 1);
    }

    await supabase.from("subscriptions").upsert({
      user_id,
      plan,
      status: "active",
      paystack_ref: reference,
      expires_at: expiresAt.toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Paystack verification error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}

