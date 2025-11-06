"use client";

import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { CoachMessage } from "@/lib/openai/coach";
import { Profile, Expense, SavingsGoal } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
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
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import EmojiPicker, { EmojiClickData } from "emoji-picker-react";
import { format } from "date-fns";

interface CoachChatProps {
  profile: Profile | null;
  initialMessages: CoachMessage[];
  userExpenses: Expense[];
  userGoals: SavingsGoal[];
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
}: CoachChatProps) {
  const [messages, setMessages] = useState<MessageWithMeta[]>(
    initialMessages.length > 0
      ? initialMessages.map((msg) => ({
          ...msg,
          timestamp: new Date().toISOString(),
        }))
      : [
          {
            role: "assistant",
            content: `Welcome back, ${profile?.preferred_name || "Chief"}! 👋 I'm your CashDey Coach. Ready to help you manage your money like a pro. What's on your mind today?`,
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
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "error">("connecting");

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const supabase = createClient();
  const { toast } = useToast();

  // Check connection status on mount
  useEffect(() => {
    const checkConnection = async () => {
      setConnectionStatus("connecting");
      try {
        // Simple connectivity check - if we can reach the API, we're connected
        // We'll set to connected initially and update on first actual request
        setConnectionStatus("connected");
      } catch (error) {
        setConnectionStatus("error");
      }
    };
    checkConnection();
  }, []);

  // Update speech recognition language when profile communication style changes
  useEffect(() => {
    if (recognitionRef.current) {
      // For Pidgin, we'll use English recognition but the AI will respond in Pidgin
      recognitionRef.current.lang = "en-US";
    }
  }, [profile?.communication_style]);

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

        // If transcribe to email is enabled, convert to text
        if (transcribeToEmail && recognitionRef.current) {
          setIsTranscribing(true);
          recognitionRef.current.start();
        } else {
          // For now, we'll just send a placeholder message
          // In production, you'd upload the audio and transcribe it
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
          preferredName: profile?.preferred_name || "Chief",
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

      // Text-to-speech if enabled
      if (speechSynthesisEnabled && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(response);
        // Use English for TTS (Pidgin will be spoken in English accent)
        utterance.lang = "en-US";
        window.speechSynthesis.speak(utterance);
      }

      // Save to database
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

  const handleSendTranscript = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      toast({
        title: "Error",
        description: "No email found. Please check your profile.",
        variant: "destructive",
      });
      return;
    }

    setSendingTranscript(true);
    try {
      const response = await fetch("/api/coach/transcribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages,
          userEmail: user.email,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send transcript");
      }

      toast({
        title: "Success",
        description: "Conversation transcript sent to your email!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send transcript. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSendingTranscript(false);
    }
  };

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return <File className="w-4 h-4" />;
    if (fileType.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  return (
    <div className="max-w-sm mx-auto bg-light-bg min-h-screen pb-24 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-40 glass-effect px-4 py-4 border-b border-gray-200/50 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-naija-green to-eko-teal rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl font-bold text-text-dark tracking-tight">CashDey Coach</h1>
                {/* Connection Status Indicator */}
                <div className="flex items-center gap-1.5">
                  {connectionStatus === "connected" && (
                    <div className="flex items-center gap-1 text-xs text-green-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="hidden sm:inline">Connected</span>
                    </div>
                  )}
                  {connectionStatus === "connecting" && (
                    <div className="flex items-center gap-1 text-xs text-yellow-600">
                      <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="hidden sm:inline">Connecting...</span>
                    </div>
                  )}
                  {connectionStatus === "error" && (
                    <div className="flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span className="hidden sm:inline">Error</span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-text-muted font-medium">AI Financial Advisor</p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2">
            {/* Language Display (read-only, matches profile) */}
            <div className="hidden sm:inline-flex items-center justify-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1.5 text-xs font-medium border border-gray-200">
              <Languages className="w-3.5 h-3.5" />
              <span>
                {profile?.communication_style === "formal" ? "English" : profile?.communication_style === "pidgin" ? "Pidgin" : "Auto"}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setSpeechSynthesisEnabled(!speechSynthesisEnabled)}
              title={speechSynthesisEnabled ? "Disable voice responses" : "Enable voice responses"}
            >
              {speechSynthesisEnabled ? (
                <Volume2 className="w-4 h-4" />
              ) : (
                <VolumeX className="w-4 h-4" />
              )}
            </Button>
            {messages.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendTranscript}
                disabled={sendingTranscript}
                className="hidden sm:flex text-xs px-2"
              >
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                {sendingTranscript ? "Sending..." : "Email"}
              </Button>
            )}
          </div>
        </div>
        </div>

      {/* Mode Toggle */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
          <Button
            variant={mode === "text" ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            onClick={() => {
              setMode("text");
              setShowEmojiPicker(false);
            }}
          >
            <FileText className="w-3.5 h-3.5 sm:mr-2" />
            <span className="hidden sm:inline">Text</span>
          </Button>
          <Button
            variant={mode === "voice" ? "default" : "ghost"}
            size="sm"
            className="flex-1 text-xs sm:text-sm"
            onClick={() => {
              setMode("voice");
              setShowEmojiPicker(false);
            }}
          >
            <Mic className="w-3.5 h-3.5 sm:mr-2" />
            <span className="hidden sm:inline">Voice</span>
          </Button>
        </div>
      </div>

      {/* Chat Messages - WhatsApp Style */}
      <div className="flex-1 flex flex-col mb-4 px-4 overflow-hidden">
        <Card className="flex-1 flex flex-col bg-[#ECE5DD] shadow-soft border-gray-200/50">
          <CardContent className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 hide-scrollbar">
          {messages.length === 1 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">Start a conversation</p>
              <p className="text-sm text-muted-foreground">
                Ask about budgeting, saving, or investments.
              </p>
            </div>
          )}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3 py-2 shadow-sm ${
                  message.role === "user"
                    ? "bg-[#DCF8C6] text-[#303030] rounded-tr-none"
                    : "bg-white text-[#303030] rounded-tl-none"
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
                      <div className="flex items-center gap-2 p-2 bg-muted rounded">
                        {getFileIcon(message.fileType)}
                        <span className="text-sm truncate">{message.fileName}</span>
                      </div>
                    )}
                  </div>
                )}
                <p className="text-sm whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                {message.timestamp && (
                  <p className="text-xs text-muted-foreground mt-1 text-right">
                    {format(new Date(message.timestamp), "HH:mm")}
                  </p>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg px-3 py-2 rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
          </CardContent>
        </Card>
      </div>

      {/* Voice Mode Toggle for Transcription */}
      {mode === "voice" && (
        <div className="px-4 mb-2 flex items-center gap-2">
          <input
            type="checkbox"
            id="transcribe"
            checked={transcribeToEmail}
            onChange={(e) => setTranscribeToEmail(e.target.checked)}
            className="rounded"
          />
          <label htmlFor="transcribe" className="text-xs text-text-muted font-medium">
            Transcribe voice to text
          </label>
        </div>
      )}

      {/* Input Area */}
      <div className="relative px-4 pb-4">
        {showEmojiPicker && (
          <div className="absolute bottom-full mb-2 right-0 z-50">
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
          <div className="mb-2 flex items-center gap-2 p-2 bg-muted rounded-lg">
            {getFileIcon(selectedFile.type)}
            <span className="text-sm flex-1 truncate">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={removeFile}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        <div className="flex gap-2 items-end">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            accept="image/*,application/pdf,.doc,.docx"
          />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Paperclip className="w-5 h-5" />
          </Button>

          {mode === "text" ? (
            <>
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                  placeholder="Type a message..."
                  disabled={loading}
                  className="pr-10"
                />
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={loading}
              >
                <Smile className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleSend}
                disabled={loading || (!input.trim() && !selectedFile)}
                className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
              >
                <Send className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={isTranscribing ? "Listening..." : "Tap mic to record or type here..."}
                  disabled={loading || isRecording || isTranscribing}
                  readOnly={isRecording || isTranscribing}
                />
              </div>
              {isRecording ? (
                <Button
                  onClick={stopVoiceRecording}
                  disabled={loading}
                  variant="destructive"
                  className="animate-pulse"
                >
                  <MicOff className="w-4 h-4 mr-2" />
                  Stop
                </Button>
              ) : (
                <Button
                  onClick={startVoiceRecording}
                  disabled={loading || isTranscribing}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                >
                  <Mic className="w-4 h-4 mr-2" />
                  Record
                </Button>
              )}
              {input && (
                <Button
                  onClick={handleSend}
                  disabled={loading}
                  className="bg-[#25D366] hover:bg-[#20BA5A] text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
