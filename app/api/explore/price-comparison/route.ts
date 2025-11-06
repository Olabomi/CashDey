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
    const { productName, preferredName, communicationStyle } = body;

    if (!productName) {
      return NextResponse.json({ error: "Product name required" }, { status: 400 });
    }

    // Use OpenAI with web search capability to find price information
    // Note: This uses the model's training data and reasoning. For real-time prices,
    // you would integrate with a price comparison API or web scraping service
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(preferredName || "Chief", communicationStyle || "auto"),
        },
        {
          role: "user",
          content: `Research and provide price information for "${productName}" in Nigeria. 
          Include:
          1. Typical price range in Nigerian Naira (₦)
          2. Where it's commonly available (online stores, physical stores)
          3. Price comparison if available from different sellers
          4. Any tips for getting the best price
          
          Format the response in a friendly, conversational way. If you cannot find specific current prices, provide general guidance based on similar products or suggest checking online stores like Jumia, Konga, or local markets.`,
        },
      ],
      max_tokens: 400,
      temperature: 0.7,
    });

    const priceInfo = response.choices[0]?.message?.content || "";

    // Generate a follow-up response asking if they want to add as expense or goal
    const followUpResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(preferredName || "Chief", communicationStyle || "auto"),
        },
        {
          role: "user",
          content: `Based on the price information for "${productName}": ${priceInfo}
          
          Generate a friendly response that:
          1. Summarizes the price information clearly
          2. Asks the user what they'd like to do:
             - Buy it now (add as expense)
             - Save for it (create a savings goal)
             - Just checking prices (no action)
          3. Provides the suggested action in JSON format:
          {
            "response": "your friendly message asking what they want to do",
            "suggestedAction": {
              "type": null (let user decide),
              "data": {
                "description": "${productName}",
                "amount": estimated price if available (as number, not string),
                "category": "Shopping" (for expense - must be from EXPENSE_CATEGORIES) or "New Gadget" (for goal - must be from GOAL_CATEGORIES)
              }
            }
          }
          
          Don't set the type automatically - let the user decide. Only provide the data structure.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const followUpData = JSON.parse(followUpResponse.choices[0]?.message?.content || "{}");

    return NextResponse.json({
      response: `${priceInfo}\n\n${followUpData.response || "Would you like to buy this now or save for it?"}`,
      suggestedAction: followUpData.suggestedAction || {
        type: null,
        data: {
          description: productName,
          category: "Shopping",
        },
      },
    });
  } catch (error: any) {
    console.error("Price comparison error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to compare prices" },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(preferredName: string, communicationStyle: CommunicationStyle): string {
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
  prompt += `Be helpful, conversational, and provide practical advice for Nigerian market. `;

  return prompt;
}

