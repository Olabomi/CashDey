"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CoachMessage } from "@/lib/openai/coach";
import { Profile, Expense, SavingsGoal } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Paperclip,
  Smile,
  X,
  Mail,
  Volume2,
  VolumeX,
  FileText,
  Image as ImageIcon,
  File,
  Wifi,
  WifiOff,
  AlertCircle,
  Languages,
  ArrowLeft,
  Phone,
  MoreVertical,
  Plus,
  Minus,
  PieChart,
  Bell,
  Target,
  Crown,
  Lock,
  Copy,
  Share2,
  Bookmark,
  Trash2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { format } from "date-fns";

interface CoachChatProps {
  profile: Profile | null;
  initialMessages: CoachMessage[];
  userExpenses: Expense[];
  userGoals: SavingsGoal[];
  balance: number;
  subscription: { plan: string; status: string } | null;
}

type ChatMode = "text" | "voice";
type MessageWithMeta = CoachMessage & {
  timestamp?: string;
  fileUrl?: string;
  fileName?: string;
  fileType?: string;
};

export default function CoachChat({
  profile,
  initialMessages,
  userExpenses,
  userGoals,
  balance,
  subscription,
}: CoachChatProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<MessageWithMeta[]>(
    initialMessages.length > 0
      ? initialMessages.map((msg) => ({
          ...msg,
          timestamp: new Date().toISOString(),
        }))
      : [
          {
            role: "assistant",
            content: `Welcome back, ${profile?.preferred_name || "Boss"}! 👋 I don see say your balance dey ₦${balance.toLocaleString()}. How you wan tackle your money today?`,
            timestamp: new Date().toISOString(),
          },
        ]
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<ChatMode>("text");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeToEmail, setTranscribeToEmail] = useState(false);
  const [sendingTranscript, setSendingTranscript] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [speechSynthesisEnabled, setSpeechSynthesisEnabled] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connected");
  const [showOfflineBanner, setShowOfflineBanner] = useState(false);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(false);
  const [selectedMessageIndex, setSelectedMessageIndex] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();
  const { toast } = useToast();

  const isPremium = subscription?.plan !== "free" && subscription?.status === "active";

  // Check connection status on mount and monitor network
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus("connecting");
      try {
        setConnectionStatus("connected");
      } catch (error) {
        setConnectionStatus("error");
      }
    };
    checkConnection();

    // Monitor online/offline status
    const handleOnline = () => {
      setConnectionStatus("connected");
      setShowOfflineBanner(false);
    };
    const handleOffline = () => {
      setConnectionStatus("error");
      setShowOfflineBanner(true);
      setTimeout(() => setShowOfflineBanner(false), 5000);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition =
        (window as any).webkitSpeechRecognition ||
        (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsTranscribing(false);
      };

      recognitionRef.current.onerror = () => {
        setIsTranscribing(false);
        toast({
          title: "Error",
          description: "Speech recognition failed. Please try again.",
          variant: "destructive",
        });
      };
    }
  }, [toast]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setInput((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        if (transcribeToEmail && recognitionRef.current) {
          setIsTranscribing(true);
          recognitionRef.current.start();
        } else {
          setInput("🎤 Voice message recorded");
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not access microphone. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedFile) || loading) return;

    const userMessage: MessageWithMeta = {
      role: "user",
      content: input || (selectedFile ? `📎 ${selectedFile.name}` : ""),
      timestamp: new Date().toISOString(),
      fileUrl: filePreview || undefined,
      fileName: selectedFile?.name,
      fileType: selectedFile?.type,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setSelectedFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    setLoading(true);
    setConnectionStatus("connecting");

    try {
      const apiResponse = await fetch("/api/coach", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ timestamp, fileUrl, fileName, fileType, ...msg }) => msg),
          preferredName: profile?.preferred_name || "Boss",
          communicationStyle: profile?.communication_style || "auto",
          userExpenses,
          userGoals,
        }),
      });

      if (!apiResponse.ok) {
        setConnectionStatus("error");
        const errorData = await apiResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response from coach");
      }

      setConnectionStatus("connected");
      const { response } = await apiResponse.json();

      const assistantMessage: MessageWithMeta = {
        role: "assistant",
        content: response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      if (speechSynthesisEnabled && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response);
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        await supabase.from("ai_conversations").upsert({
          user_id: user.id,
          messages: [...messages, userMessage, assistantMessage].map(
            ({ timestamp, fileUrl, fileName, fileType, ...msg }) => msg
          ),
        });
      }
    } catch (error) {
      setConnectionStatus("error");
      toast({
        title: "Error",
        description: "Failed to get response from coach",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInput(text);
    inputRef.current?.focus();
  };

  const handleUpgrade = () => {
    router.push("/dashboard/subscription");
  };

  const formatBalance = (amount: number) => {
    return `₦${amount.toLocaleString()}`;
  };

  return (
    <div className="max-w-sm mx-auto bg-white min-h-screen relative overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.back()}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-br from-naija-green to-eko-teal flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Your Coach</h1>
                <p className="text-xs text-green-500 flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                  {connectionStatus === "connected" ? "Online" : connectionStatus === "connecting" ? "Connecting..." : "Offline"}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <Phone className="w-5 h-5 text-gray-600" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>
      </header>

      {/* Chat Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 px-4 py-4 pb-32 space-y-4 overflow-y-auto"
        style={{ height: "calc(100vh - 180px)" }}
      >
        {/* Date Separator */}
        <div className="flex justify-center mb-4">
          <span className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">Today</span>
        </div>

        {/* Messages */}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex items-start space-x-2 ${message.role === "user" ? "justify-end" : ""}`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-naija-green to-eko-teal flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
            )}
            <div className={`flex-1 ${message.role === "user" ? "flex justify-end" : ""}`}>
              <div
                className={`${
                  message.role === "user"
                    ? "bg-eko-teal rounded-2xl rounded-tr-md p-4 max-w-xs ml-auto"
                    : "bg-gray-100 rounded-2xl rounded-tl-md p-4 max-w-xs"
                }`}
              >
                {message.fileUrl && (
                  <div className="mb-2">
                    {message.fileType?.startsWith("image/") ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={message.fileUrl}
                        alt={message.fileName}
                        className="max-w-full rounded-lg"
                      />
                    ) : (
                      <div className="flex items-center gap-2 p-2 bg-white/50 rounded">
                        {message.fileType?.startsWith("image/") ? (
                          <ImageIcon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span className="text-sm truncate">{message.fileName}</span>
                      </div>
                    )}
                  </div>
                )}
                <p
                  className={`text-sm leading-relaxed ${
                    message.role === "user" ? "text-white" : "text-gray-800"
                  }`}
                >
                  {message.content}
                </p>
                {message.timestamp && (
                  <p className={`text-xs mt-1 ${message.role === "user" ? "text-white/70 text-right" : "text-gray-500 ml-2"}`}>
                    {format(new Date(message.timestamp), "h:mm a")}
                  </p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {loading && (
          <div className="flex items-start space-x-2 mb-4">
            <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-gradient-to-br from-naija-green to-eko-teal flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl rounded-tl-md p-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Reply Chips */}
      <div className="px-4 py-2 bg-white border-t border-gray-100">
        <div className="flex space-x-2 overflow-x-auto pb-2 hide-scrollbar">
          <button
            onClick={() => handleQuickReply("Log Expense")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center space-x-2 hover:bg-gray-200 transition-colors"
          >
            <Minus className="w-4 h-4 text-red-500" />
            <span>Log Expense</span>
          </button>
          <button
            onClick={() => handleQuickReply("See Report")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center space-x-2 hover:bg-gray-200 transition-colors"
          >
            <PieChart className="w-4 h-4 text-blue-500" />
            <span>See Report</span>
          </button>
          <button
            onClick={() => handleQuickReply("Set Reminder")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center space-x-2 hover:bg-gray-200 transition-colors"
          >
            <Bell className="w-4 h-4 text-orange-500" />
            <span>Set Reminder</span>
          </button>
          <button
            onClick={() => handleQuickReply("My Goals")}
            className="bg-gray-100 text-gray-700 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex items-center space-x-2 hover:bg-gray-200 transition-colors"
          >
            <Target className="w-4 h-4 text-green-500" />
            <span>My Goals</span>
          </button>
        </div>
      </div>

      {/* Message Input Area */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-white border-t border-gray-200 px-4 py-3">
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 right-4 z-50">
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              width={typeof window !== "undefined" ? Math.min(350, window.innerWidth - 32) : 350}
              height={400}
            />
          </div>
        )}

        {filePreview && (
          <div className="mb-2 relative inline-block">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={filePreview}
                alt="Preview"
                className="max-w-[200px] max-h-[200px] rounded-lg"
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={removeFile}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}

        {selectedFile && !filePreview && (
          <div className="mb-2 flex items-center gap-2 p-2 bg-gray-100 rounded-lg">
            <FileText className="w-4 h-4" />
            <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={removeFile}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex items-end space-x-3">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf,.doc,.docx"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>
          <div className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 min-h-[44px] flex items-center">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Ask your coach anything..."
              disabled={loading}
              className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-500"
            />
            <button
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={loading}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <Smile className="w-5 h-5" />
            </button>
          </div>
          {mode === "text" ? (
            <button
              onClick={handleSend}
              disabled={loading || (!input.trim() && !selectedFile)}
              className="w-10 h-10 bg-naija-green rounded-full flex items-center justify-center hover:bg-eko-teal transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          ) : (
            <>
              {isRecording ? (
                <button
                  onClick={stopVoiceRecording}
                  disabled={loading}
                  className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors animate-pulse"
                >
                  <MicOff className="w-4 h-4 text-white" />
                </button>
              ) : (
                <button
                  onClick={startVoiceRecording}
                  disabled={loading || isTranscribing}
                  className="w-10 h-10 bg-naija-green rounded-full flex items-center justify-center hover:bg-eko-teal transition-colors"
                >
                  <Mic className="w-4 h-4 text-white" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Offline Banner */}
      {showOfflineBanner && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 w-full max-w-sm bg-orange-100 border border-orange-200 px-4 py-2 z-40 animate-slide-down">
          <div className="flex items-center justify-center space-x-2">
            <WifiOff className="w-4 h-4 text-orange-600" />
            <span className="text-orange-700 text-sm">Network dey behave but I still dey here</span>
          </div>
        </div>
      )}

      {/* Free User Limit Modal */}
      {showLimitModal && !isPremium && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-palm-gold/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Crown className="w-8 h-8 text-palm-gold" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">You don reach your daily limit</h3>
              <p className="text-gray-600 text-sm">Free users get 10 coach messages per day. Upgrade to CashDey+ for unlimited chats!</p>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <span className="text-naija-green">∞</span>
                <span className="text-sm text-gray-700">Unlimited coach conversations</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <PieChart className="w-5 h-5 text-naija-green" />
                <span className="text-sm text-gray-700">Advanced analytics & insights</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <Target className="w-5 h-5 text-naija-green" />
                <span className="text-sm text-gray-700">Personalized financial plans</span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleUpgrade}
                className="w-full bg-palm-gold text-white font-medium py-3 rounded-xl hover:bg-palm-gold-light transition-colors"
              >
                Upgrade to CashDey+ - ₦2,999/month
              </button>
              <button
                onClick={() => setShowLimitModal(false)}
                className="w-full text-gray-600 font-medium py-2 hover:text-gray-800 transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Options Menu */}
      {showMessageMenu && (
        <div
          className="fixed inset-0 bg-black/20 z-50"
          onClick={() => setShowMessageMenu(false)}
        >
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4">
            <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4"></div>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <Copy className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Copy Message</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <Share2 className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Share</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                <Bookmark className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700">Save Tip</span>
              </button>
              <button className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg text-red-600">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span>Delete</span>
              </button>
            </div>
            <button
              onClick={() => setShowMessageMenu(false)}
              className="w-full mt-4 p-3 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
