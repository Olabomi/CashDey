import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { CommunicationStyle } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
    const { message, messages, currentAnalysis, preferredName, communicationStyle, userExpenses, userGoals } = body;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    const systemPrompt = buildSystemPrompt(
      preferredName || "Chief",
      communicationStyle || "auto",
      currentAnalysis,
      userExpenses,
      userGoals
    );

    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.slice(-10).map((msg: any) => ({
          role: msg.role,
          content: msg.content,
        })),
        { role: "user", content: message },
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0]?.message?.content || "";

    // Check if user wants to add expense/goal based on their message
    const lowerMessage = message.toLowerCase();
    let suggestedAction = null;
    let responseText = "";

    if (currentAnalysis) {
      // Handle bills/receipts - user confirms adding expense
      if ((currentAnalysis.type === "bill" || currentAnalysis.type === "receipt") && 
          (lowerMessage.includes("yes") || lowerMessage.includes("add") || lowerMessage.includes("confirm"))) {
        suggestedAction = {
          type: "add_expense",
          data: {
            amount: currentAnalysis.amount || currentAnalysis.suggestedAction?.data?.amount || 0,
            category: currentAnalysis.category || currentAnalysis.suggestedAction?.data?.category || "Other", // Must be from EXPENSE_CATEGORIES
            description: currentAnalysis.description || currentAnalysis.merchant || currentAnalysis.suggestedAction?.data?.description || "",
            date: currentAnalysis.date || new Date().toISOString().split("T")[0],
          },
        };
        responseText = "Perfect! I'll add that expense for you. Click the button below to confirm.";
      }
      // Handle products - user wants to buy now
      else if (currentAnalysis.type === "product" && 
               (lowerMessage.includes("buy") || lowerMessage.includes("purchase") || lowerMessage.includes("buy now"))) {
        const price = currentAnalysis.price || currentAnalysis.suggestedAction?.data?.amount || 0;
        suggestedAction = {
          type: "add_expense",
          data: {
            amount: price,
            category: currentAnalysis.suggestedAction?.data?.category || "Shopping",
            description: currentAnalysis.productName || currentAnalysis.description || currentAnalysis.suggestedAction?.data?.description || "",
            date: new Date().toISOString().split("T")[0],
          },
        };
        responseText = "Got it! I'll add this purchase to your expenses. Click the button below to confirm.";
      }
      // Handle products - user wants to save for it (goal)
      else if (currentAnalysis.type === "product" && 
               (lowerMessage.includes("save") || lowerMessage.includes("goal") || lowerMessage.includes("save for"))) {
        const targetAmount = currentAnalysis.price || currentAnalysis.suggestedAction?.data?.amount || 0;
        suggestedAction = {
          type: "add_goal",
          data: {
            name: currentAnalysis.productName || currentAnalysis.description || currentAnalysis.suggestedAction?.data?.description || "Product Goal",
            targetAmount: targetAmount,
            category: currentAnalysis.suggestedAction?.data?.category || "New Gadget",
            deadline: null,
          },
        };
        responseText = "Great choice! I'll create a savings goal for this. Click the button below to confirm.";
      }
      // User said no or skip
      else if (lowerMessage.includes("no") || lowerMessage.includes("skip") || lowerMessage.includes("not now")) {
        responseText = "No problem! Feel free to upload another image or ask me anything else about your finances.";
      }
    }

    // Use custom response if we detected user intent, otherwise use AI response
    let finalResponse = assistantMessage;
    if (responseText) {
      finalResponse = responseText;
    }

    return NextResponse.json({
      response: finalResponse,
      suggestedAction,
    });
  } catch (error: any) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to get response" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  preferredName: string,
  communicationStyle: CommunicationStyle,
  currentAnalysis?: any,
  userExpenses?: any[],
  userGoals?: any[]
): string {
  let prompt = `You are CashDey Visual Analyzer, a friendly financial assistant for Nigerians. `;

  if (communicationStyle === "pidgin") {
    prompt += `Always respond in Nigerian Pidgin English. Be friendly, use "Boss", "Oga", "Naija" style. `;
  } else if (communicationStyle === "formal") {
    prompt += `Always respond in formal, professional English. `;
  } else {
    prompt += `Adapt your communication style - use Pidgin for casual topics, formal English for serious financial advice. `;
  }

  prompt += `Address the user as "${preferredName}". `;
  prompt += `Currency is Nigerian Naira (₦). `;

  if (currentAnalysis) {
    prompt += `Current analysis context: ${JSON.stringify(currentAnalysis)}. `;
    prompt += `Guide the user to add this to their expenses or goals if appropriate. `;
  }

  if (userExpenses && userExpenses.length > 0) {
    const totalSpent = userExpenses
      .filter((e: any) => e.type === "expense")
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    prompt += `User's total expenses: ₦${totalSpent.toLocaleString()}. `;
  }

  if (userGoals && userGoals.length > 0) {
    prompt += `User has ${userGoals.length} savings goal(s). `;
  }

  prompt += `Be helpful, conversational, and guide the user through the process. Ask clarifying questions if needed.`;

  return prompt;
}

