import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

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
    const { messages, userEmail } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
    }

    // Format conversation transcript
    const transcript = messages
      .map((msg: any) => {
        const role = msg.role === "user" ? "You" : "CashDey Coach";
        const timestamp = msg.timestamp
          ? new Date(msg.timestamp).toLocaleString()
          : "";
        return `[${timestamp}]\n${role}: ${msg.content}\n`;
      })
      .join("\n");

    const emailContent = `
Hello ${user.email || "there"},

Here's your conversation transcript with CashDey Coach:

${transcript}

---
This is an automated email from CashDey.
    `.trim();

    // Send email using Resend
    if (resend && process.env.RESEND_API_KEY) {
      try {
        await resend.emails.send({
          from: process.env.RESEND_FROM_EMAIL || "CashDey <noreply@cashdey.com>",
          to: userEmail || user.email || "",
          subject: "Your CashDey Coach Conversation Transcript",
          text: emailContent,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #16a34a;">CashDey Coach Conversation Transcript</h2>
              <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; white-space: pre-wrap; font-family: monospace;">
${transcript}
              </div>
              <p style="color: #6b7280; font-size: 12px; margin-top: 20px;">
                This is an automated email from CashDey.
              </p>
            </div>
          `,
        });
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        throw new Error("Failed to send email. Please check your email configuration.");
      }
    } else {
      console.warn("RESEND_API_KEY not configured. Email not sent.");
      // In development, we can still return success but log a warning
      if (process.env.NODE_ENV === "production") {
        throw new Error("Email service not configured");
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Transcription email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to send transcript" },
      { status: 500 }
    );
  }
}

