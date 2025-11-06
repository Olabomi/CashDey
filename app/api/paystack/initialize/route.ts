import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { initializePayment, getPlanAmount } from "@/lib/paystack/client";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { plan } = await request.json();

    if (!plan || (plan !== "monthly" && plan !== "yearly")) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const amount = getPlanAmount(plan);
    const reference = `cashdey_${user.id}_${Date.now()}`;

    const payment = await initializePayment(user.email!, amount, reference, {
      user_id: user.id,
      plan,
    });

    return NextResponse.json({
      authorization_url: payment.data.authorization_url,
      reference,
    });
  } catch (error: any) {
    console.error("Paystack initialization error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to initialize payment" },
      { status: 500 }
    );
  }
}

