"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Send, Bot, Image as ImageIcon, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Profile, Expense, SavingsGoal, EXPENSE_CATEGORIES, GOAL_CATEGORIES, INCOME_CATEGORIES } from "@/types";
import { format } from "date-fns";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  imageUrl?: string;
  actions?: {
    type: "add_expense" | "add_goal" | "skip";
    data?: any;
  };
}

export default function VisualAnalyzer() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userExpenses, setUserExpenses] = useState<Expense[]>([]);
  const [userGoals, setUserGoals] = useState<SavingsGoal[]>([]);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: `Hey Chief! 👋 I'm your Visual Analyzer. Upload a photo of a bill, receipt, or product, and I'll help you analyze it and track it in your finances. What would you like to analyze?`,
      timestamp: new Date().toISOString(),
    },
  ]);

  useEffect(() => {
    if (profile && messages.length === 1 && messages[0].content.includes("Chief")) {
      setMessages([
        {
          role: "assistant",
          content: `Hey ${profile.preferred_name || "Chief"}! 👋 I'm your Visual Analyzer. Upload a photo of a bill, receipt, or product, and I'll help you analyze it and track it in your finances. What would you like to analyze?`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [currentAnalysis, setCurrentAnalysis] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const [profileResult, expensesResult, goalsResult] = await Promise.all([
          supabase.from("profiles").select("*").eq("user_id", user.id).single(),
          supabase.from("expenses").select("*").eq("user_id", user.id).order("date", { ascending: false }),
          supabase.from("savings_goals").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
        ]);

        if (profileResult.data) setProfile(profileResult.data);
        if (expensesResult.data) setUserExpenses(expensesResult.data);
        if (goalsResult.data) setUserGoals(goalsResult.data);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        analyzeImage(file);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (file: File) => {
    setLoading(true);
    const userMessage: Message = {
      role: "user",
      content: "Analyzing image...",
      timestamp: new Date().toISOString(),
      imageUrl: selectedImage || undefined,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      // Convert image to base64
      const base64Image = await fileToBase64(file);

      // Call API to analyze image
      const response = await fetch("/api/explore/visual-analyzer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image: base64Image,
          preferredName: profile?.preferred_name || "Chief",
          communicationStyle: profile?.communication_style || "auto",
          userExpenses,
          userGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to analyze image");
      }

      const data = await response.json();
      setCurrentAnalysis({
        ...data.analysis,
        type: data.analysis?.type,
        suggestedAction: data.suggestedAction,
      });

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        actions: data.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to analyze image",
        variant: "destructive",
      });
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I couldn't analyze that image. Please try again with a clearer photo.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handlePriceComparison = async (productName: string) => {
    setLoading(true);
    const userMessage: Message = {
      role: "user",
      content: `Can you check prices for ${productName}?`,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const response = await fetch("/api/explore/price-comparison", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productName,
          preferredName: profile?.preferred_name || "Chief",
          communicationStyle: profile?.communication_style || "auto",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to compare prices");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        actions: data.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update current analysis if price comparison suggests an action
      if (data.suggestedAction) {
        setCurrentAnalysis((prev: any) => ({
          ...prev,
          type: prev?.type || "product",
          productName: productName,
          suggestedAction: data.suggestedAction,
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to compare prices",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddExpense = async (expenseData: any) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      // Validate category is from EXPENSE_CATEGORIES
      const validCategory = EXPENSE_CATEGORIES.includes(expenseData.category as any)
        ? expenseData.category
        : "Other";

      const { error } = await supabase.from("expenses").insert({
        user_id: user.id,
        amount: expenseData.amount,
        category: validCategory,
        description: expenseData.description,
        date: expenseData.date || new Date().toISOString().split("T")[0],
        type: "expense",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Expense added successfully!",
      });

      const successMessage: Message = {
        role: "assistant",
        content: "✅ Great! I've added that expense to your wallet. Is there anything else you'd like me to analyze?",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, successMessage]);
      setCurrentAnalysis(null);
      setSelectedImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add expense",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (goalData: any) => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("Not authenticated");
      }

      const { error } = await supabase.from("savings_goals").insert({
        user_id: user.id,
        name: goalData.name,
        target_amount: goalData.targetAmount,
        category: goalData.category || "Other",
        deadline: goalData.deadline || null,
        status: "on_track",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Success",
        description: "Goal created successfully!",
      });

      const successMessage: Message = {
        role: "assistant",
        content: "✅ Awesome! I've created that goal for you. You can track your progress in the Goals section.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, successMessage]);
      setCurrentAnalysis(null);
      setSelectedImage(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create goal",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    const skipMessage: Message = {
      role: "assistant",
      content: "No worries! Feel free to upload another image whenever you're ready. What else can I help you with?",
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, skipMessage]);
    setCurrentAnalysis(null);
    setSelectedImage(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const lowerMessage = input.toLowerCase();
      
      // Check if user is asking about price comparison for a product
      if (currentAnalysis?.type === "product" && (lowerMessage.includes("price") || lowerMessage.includes("cost") || lowerMessage.includes("how much"))) {
        const productName = currentAnalysis.productName || currentAnalysis.suggestedAction?.data?.description || "this product";
        await handlePriceComparison(productName);
        return;
      }

      // Otherwise, continue the conversation
      const response = await fetch("/api/explore/visual-analyzer/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          messages: messages.map(({ imageUrl, ...msg }) => msg),
          currentAnalysis,
          preferredName: profile?.preferred_name || "Chief",
          communicationStyle: profile?.communication_style || "auto",
          userExpenses,
          userGoals,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to get response");
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
        timestamp: new Date().toISOString(),
        actions: data.suggestedAction,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      
      // Update current analysis if new action is suggested
      if (data.suggestedAction) {
        setCurrentAnalysis((prev: any) => ({
          ...prev,
          suggestedAction: data.suggestedAction,
        }));
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to get response",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Chat Messages */}
      <Card className="flex-1 flex flex-col mb-4 bg-[#ECE5DD] overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                  message.role === "user"
                    ? "bg-[#DCF8C6] text-[#303030] rounded-tr-none"
                    : "bg-white text-[#303030] rounded-tl-none"
                }`}
              >
                {message.imageUrl && (
                  <div className="mb-2 relative w-full h-64">
                    <Image
                      src={message.imageUrl}
                      alt="Uploaded"
                      fill
                      className="object-contain rounded-lg"
                      unoptimized
                    />
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <p className="text-xs text-muted-foreground mt-1 text-right">
                  {format(new Date(message.timestamp), "HH:mm")}
                </p>

                {/* Action Buttons */}
                {message.actions && message.role === "assistant" && (
                  <div className="mt-3 space-y-2">
                    {/* Product with buy/save options */}
                    {!message.actions.type && message.actions.data && currentAnalysis?.type === "product" && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            const expenseData = {
                              ...message.actions!.data,
                              amount: message.actions!.data.amount || 0,
                            };
                            handleAddExpense(expenseData);
                          }}
                          disabled={loading}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Buy Now (Add Expense)
                        </Button>
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => {
                            const goalData = {
                              name: message.actions!.data.description || "Product Goal",
                              targetAmount: message.actions!.data.amount || 0,
                              category: "New Gadget",
                              deadline: null,
                            };
                            handleAddGoal(goalData);
                          }}
                          disabled={loading}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Save for It (Create Goal)
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={handleSkip}
                          disabled={loading}
                        >
                          Skip
                        </Button>
                      </>
                    )}
                    {/* Add expense action */}
                    {message.actions.type === "add_expense" && message.actions.data && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-green-600 hover:bg-green-700"
                          onClick={() => handleAddExpense(message.actions!.data)}
                          disabled={loading}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Add to Expenses
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={handleSkip}
                          disabled={loading}
                        >
                          Skip
                        </Button>
                      </>
                    )}
                    {/* Add goal action */}
                    {message.actions.type === "add_goal" && message.actions.data && (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleAddGoal(message.actions!.data)}
                          disabled={loading}
                        >
                          <CheckCircle2 className="w-4 h-4 mr-2" />
                          Create Goal
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={handleSkip}
                          disabled={loading}
                        >
                          Skip
                        </Button>
                      </>
                    )}
                    {/* Skip action */}
                    {message.actions.type === "skip" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={handleSkip}
                        disabled={loading}
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-3 py-2 rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </CardContent>
      </Card>

      {/* Image Upload Area */}
      {!selectedImage && (
        <div className="mb-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            className="hidden"
          />
          <Card
            className="border-2 border-dashed cursor-pointer hover:border-primary transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Upload className="w-12 h-12 text-muted-foreground mb-2" />
              <p className="text-sm font-medium mb-1">Click to upload an image</p>
              <p className="text-xs text-muted-foreground">Bills, receipts, or products</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selected Image Preview */}
      {selectedImage && (
        <div className="mb-4 relative">
          <div className="relative inline-block w-full max-w-md h-48">
            <Image
              src={selectedImage}
              alt="Selected"
              fill
              className="object-contain rounded-lg"
              unoptimized
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={() => {
                setSelectedImage(null);
                setSelectedFile(null);
                setCurrentAnalysis(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message or ask a question..."
          disabled={loading}
        />
        <Button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

