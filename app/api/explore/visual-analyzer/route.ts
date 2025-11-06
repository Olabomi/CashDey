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
    const { image, preferredName, communicationStyle, userExpenses, userGoals } = body;

    if (!image) {
      return NextResponse.json({ error: "Image required" }, { status: 400 });
    }

    // Analyze image using OpenAI Vision API
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "system",
          content: buildSystemPrompt(preferredName || "Chief", communicationStyle || "auto"),
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image. Is it a bill, receipt, or a product? Extract all relevant financial information including amounts, dates, items, and prices. If it's a product, identify the product name and any visible price. If it's a bill or receipt, extract the total amount, items, date, and merchant name. Provide a clear summary in a conversational tone.",
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
      max_tokens: 500,
    });

    const analysisText = response.choices[0]?.message?.content || "";
    
    // Get structured analysis and suggested action
    const structuredResponse = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a helpful financial assistant. Based on the image analysis, determine:
1. Type: "bill", "receipt", or "product"
2. If bill/receipt: Extract amount, category, description, date, merchant name
3. If product: Extract product name, price (if visible), description
4. Suggest appropriate action based on type:
   - For bills/receipts: suggest "add_expense" with the extracted data
   - For products: ask user if they want price comparison, or if they're buying it (add_expense) or saving for it (add_goal)
5. Generate a friendly, conversational response

Respond in JSON format: {
  "type": "bill" | "receipt" | "product",
  "response": "friendly message to user asking what they'd like to do",
  "suggestedAction": {
    "type": "add_expense" | "add_goal" | "skip" | null,
    "data": { expense/goal data if applicable }
  },
  "analysis": {
    "amount": number (if bill/receipt),
    "category": string (if bill/receipt),
    "description": string,
    "date": string (ISO format, if available),
    "merchant": string (if bill/receipt),
    "productName": string (if product),
    "price": number (if product and visible)
  }
}

Use Nigerian Naira (₦) for currency. 
For expenses, categories must be one of: Food & Drinks, Transport, Shopping, Bills, Entertainment, Education, Healthcare, Rent, Utilities, Other.
Income categories are different and should not be used for expenses.

If it's a product, ask if they want to check prices online, buy it now, or save for it.`,
        },
        {
          role: "user",
          content: `Image Analysis: ${analysisText}

User's communication style: ${communicationStyle || "auto"}
User's preferred name: ${preferredName || "Chief"}

Generate the structured response based on this analysis.`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const structuredData = JSON.parse(structuredResponse.choices[0]?.message?.content || "{}");

    // Ensure product name is included in analysis for price comparison
    if (structuredData.type === "product" && structuredData.analysis) {
      structuredData.analysis.productName = structuredData.analysis.productName || structuredData.analysis.description || "Unknown Product";
    }

    return NextResponse.json({
      response: structuredData.response || analysisText,
      suggestedAction: structuredData.suggestedAction || null,
      analysis: {
        ...structuredData.analysis,
        type: structuredData.type,
        productName: structuredData.analysis?.productName,
      },
    });
  } catch (error: any) {
    console.error("Visual analyzer error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze image" },
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
  prompt += `Be conversational, helpful, and guide the user through the process. `;

  return prompt;
}

