import OpenAI from "openai";
import { CommunicationStyle } from "@/types";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CoachMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export async function getCoachResponse(
  messages: CoachMessage[],
  preferredName: string,
  communicationStyle: CommunicationStyle,
  userExpenses?: any[],
  userGoals?: any[]
): Promise<string> {
  const systemPrompt = buildSystemPrompt(
    preferredName,
    communicationStyle,
    userExpenses,
    userGoals
  );

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
      ],
      max_tokens: communicationStyle === "formal" ? 200 : 150,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("OpenAI API error:", error);
    return "Sorry, I'm having trouble connecting right now. Please try again later.";
  }
}

function buildSystemPrompt(
  preferredName: string,
  communicationStyle: CommunicationStyle,
  userExpenses?: any[],
  userGoals?: any[]
): string {
  let prompt = `You are CashDey Coach, a friendly financial advisor for Nigerians. `;

  if (communicationStyle === "pidgin") {
    prompt += `Always respond in Nigerian Pidgin English. Be friendly, use "Boss", "Oga", "Naija" style. Mix in common Pidgin phrases like "na so", "abi", "e be like say", "make we", "you sabi". `;
  } else if (communicationStyle === "formal") {
    prompt += `Always respond in formal, professional English. Use proper grammar and professional tone throughout. `;
  } else {
    prompt += `Mix English and Nigerian Pidgin naturally throughout your responses. Switch between them fluidly - use Pidgin for friendly, casual parts ("Oga, you dey try o!", "Na so we dey do am") and English for technical or serious financial advice. Make it feel natural, like a Nigerian friend who mixes both languages. Don't translate everything - mix them in the same sentence when it feels right. `;
  }

  prompt += `Address the user as "${preferredName}". `;
  prompt += `Currency is Nigerian Naira (₦). `;
  prompt += `Give practical, culturally relevant advice for Nigerian context. `;

  if (userExpenses && userExpenses.length > 0) {
    const totalSpent = userExpenses
      .filter((e: any) => e.type === "expense")
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0);
    prompt += `User's total expenses: ₦${totalSpent.toLocaleString()}. `;
  }

  if (userGoals && userGoals.length > 0) {
    prompt += `User has ${userGoals.length} savings goal(s). `;
  }

  prompt += `Keep responses concise and actionable. Focus on practical tips for saving money, managing expenses, and reaching financial goals in Nigeria.`;

  return prompt;
}

