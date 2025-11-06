import { createClient } from "@/lib/supabase/server";
import { getCoachResponse } from "@/lib/openai/coach";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, preferredName, communicationStyle, userExpenses, userGoals } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    const response = await getCoachResponse(
      messages,
      preferredName || "Chief",
      communicationStyle || "auto",
      userExpenses,
      userGoals
    );

    return NextResponse.json({ response });
  } catch (error: any) {
    console.error("Coach API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get coach response" },
      { status: 500 }
    );
  }
}

