"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CoachMessage } from "@/lib/openai/coach";
import { Profile, Expense, SavingsGoal } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CoachChatProps {
  profile: Profile | null;
  initialMessages: CoachMessage[];
  userExpenses: Expense[];
  userGoals: SavingsGoal[];
}

export default function CoachChat({
  profile,
  initialMessages,
  userExpenses,
  userGoals,
}: CoachChatProps) {
  const [messages, setMessages] = useState<CoachMessage[]>(
    initialMessages.length > 0
      ? initialMessages
      : [
          {
            role: "assistant",
            content: `Welcome back, ${profile?.preferred_name || "Chief"}! 👋 I'm your CashDey Coach. Ready to help you manage your money like a pro. What's on your mind today?`,
          },
        ]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: CoachMessage = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      // Call the API route instead of directly calling OpenAI
      const apiResponse = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          preferredName: profile?.preferred_name || "Chief",
          communicationStyle: profile?.communication_style || "auto",
          userExpenses,
          userGoals,
        }),
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response from coach");
      }

      const { response } = await apiResponse.json();

      const assistantMessage: CoachMessage = {
        role: "assistant",
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Save to database
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("ai_conversations").upsert({
          user_id: user.id,
          messages: [...messages, userMessage, assistantMessage],
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from coach",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
          <Bot className="w-6 h-6 text-yellow-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">CashDey Coach</h1>
          <p className="text-sm text-muted-foreground">AI Financial Advisor</p>
        </div>
      </div>

      <Card className="flex-1 flex flex-col mb-4">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-sm">Thinking...</p>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask me anything about money..."
          disabled={loading}
        />
        <Button onClick={handleSend} disabled={loading || !input.trim()}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

