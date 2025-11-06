import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

// Paystack webhook secret from environment
const PAYSTACK_SECRET_KEY = Deno.env.get("PAYSTACK_SECRET_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Verify Paystack webhook signature
async function verifyPaystackSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  if (!signature || !secret) {
    return false;
  }

  const crypto = globalThis.crypto;
  const encoder = new TextEncoder();
  
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-512" },
    false,
    ["sign"]
  );
  
  const signatureBuffer = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload)
  );
  
  const computedSignature = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  
  // Paystack sends signature in hex format, compare securely
  return computedSignature.toLowerCase() === signature.toLowerCase();
}

// Calculate expiration date based on plan
function calculateExpirationDate(plan: string): Date {
  const expiresAt = new Date();
  if (plan === "monthly") {
    expiresAt.setMonth(expiresAt.getMonth() + 1);
  } else if (plan === "yearly") {
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);
  }
  return expiresAt;
}

// Handle charge.success event
async function handleChargeSuccess(
  supabase: any,
  data: any
): Promise<{ success: boolean; message: string }> {
  try {
    const { reference, metadata, amount, customer } = data;
    
    if (!metadata || !metadata.user_id || !metadata.plan) {
      return { success: false, message: "Missing metadata" };
    }

    const { user_id, plan } = metadata;
    const expiresAt = calculateExpirationDate(plan);

    // Update or insert subscription
    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id,
          plan,
          status: "active",
          paystack_ref: reference,
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Database error:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Subscription updated successfully" };
  } catch (error: any) {
    console.error("Handle charge success error:", error);
    return { success: false, message: error.message };
  }
}

// Handle subscription.create event
async function handleSubscriptionCreate(
  supabase: any,
  data: any
): Promise<{ success: boolean; message: string }> {
  try {
    const { subscription_code, customer, plan, metadata } = data;
    
    // Try to get user_id from metadata first (most reliable)
    let userId = metadata?.user_id;
    
    // If not in metadata, try to find by email
    if (!userId && customer?.email) {
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        return { success: false, message: authError.message };
      }

      const user = authData.users.find((u: any) => u.email === customer.email);
      userId = user?.id;
    }
    
    if (!userId) {
      return { success: false, message: "User not found - missing user_id in metadata or email" };
    }

    const planType = plan?.interval === "monthly" ? "monthly" : "yearly";
    const expiresAt = calculateExpirationDate(planType);

    const { error } = await supabase
      .from("subscriptions")
      .upsert(
        {
          user_id: userId,
          plan: planType,
          status: "active",
          paystack_ref: subscription_code,
          expires_at: expiresAt.toISOString(),
        },
        { onConflict: "user_id" }
      );

    if (error) {
      console.error("Database error:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Subscription created successfully" };
  } catch (error: any) {
    console.error("Handle subscription create error:", error);
    return { success: false, message: error.message };
  }
}

// Handle subscription.disable event
async function handleSubscriptionDisable(
  supabase: any,
  data: any
): Promise<{ success: boolean; message: string }> {
  try {
    const { subscription_code } = data;

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "cancelled" })
      .eq("paystack_ref", subscription_code);

    if (error) {
      console.error("Database error:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Subscription cancelled successfully" };
  } catch (error: any) {
    console.error("Handle subscription disable error:", error);
    return { success: false, message: error.message };
  }
}

// Handle invoice.payment_failed event
async function handlePaymentFailed(
  supabase: any,
  data: any
): Promise<{ success: boolean; message: string }> {
  try {
    const { subscription } = data;
    const subscriptionCode = subscription?.subscription_code;

    if (!subscriptionCode) {
      return { success: false, message: "Missing subscription code" };
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({ status: "inactive" })
      .eq("paystack_ref", subscriptionCode);

    if (error) {
      console.error("Database error:", error);
      return { success: false, message: error.message };
    }

    return { success: true, message: "Subscription marked as inactive" };
  } catch (error: any) {
    console.error("Handle payment failed error:", error);
    return { success: false, message: error.message };
  }
}

Deno.serve(async (req) => {
  // Only allow POST requests
  if (req.method !== "POST") {
    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      { status: 405, headers: { "Content-Type": "application/json" } }
    );
  }

  try {
    // Get the raw body for signature verification
    const rawBody = await req.text();
    const signature = req.headers.get("x-paystack-signature") || "";

    // Verify webhook signature
    const isValidSignature = await verifyPaystackSignature(
      rawBody,
      signature,
      PAYSTACK_SECRET_KEY
    );
    
    if (!isValidSignature) {
      console.error("Invalid webhook signature");
      return new Response(
        JSON.stringify({ error: "Invalid signature" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse the webhook payload
    const event = JSON.parse(rawBody);
    const { event: eventType, data } = event;

    console.log(`Received Paystack webhook: ${eventType}`);

    // Initialize Supabase client with service role key (bypasses RLS)
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    let result;

    // Handle different event types
    switch (eventType) {
      case "charge.success":
        result = await handleChargeSuccess(supabase, data);
        break;

      case "subscription.create":
        result = await handleSubscriptionCreate(supabase, data);
        break;

      case "subscription.disable":
        result = await handleSubscriptionDisable(supabase, data);
        break;

      case "invoice.payment_failed":
        result = await handlePaymentFailed(supabase, data);
        break;

      default:
        console.log(`Unhandled event type: ${eventType}`);
        return new Response(
          JSON.stringify({ message: "Event type not handled" }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        );
    }

    if (result.success) {
      return new Response(
        JSON.stringify({ message: result.message }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      );
    } else {
      console.error(`Error handling ${eventType}:`, result.message);
      return new Response(
        JSON.stringify({ error: result.message }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    console.error("Webhook processing error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

