# CashDey MVP Setup Guide

## Prerequisites

- Node.js 18+ installed
- A Supabase account (free tier works)
- An OpenAI API key
- A Paystack account (for payments)
- A Resend account (optional, for email transcriptions)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Supabase

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run the migration file: `supabase/migrations/001_initial_schema.sql`
3. Enable OAuth providers (Google, Apple) in Authentication > Providers
4. Get your Supabase URL and anon key from Settings > API

### 3. Setup Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Paystack
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key

# Resend (Optional - for email transcriptions)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=CashDey <noreply@yourdomain.com>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features Implemented

✅ User authentication (Email/Password + OAuth)
✅ 4-step onboarding flow
✅ Dashboard with balance, burn rate, survival days
✅ Expense tracking with categories
✅ Savings goals management
✅ AI Coach integration (GPT-4-Turbo)
✅ Paystack subscription integration
✅ Profile and settings management
✅ Responsive design for mobile
✅ WhatsApp-like chat interface with:
  - Text and Voice modes
  - Emoji picker
  - File uploads (images, PDFs, documents)
  - Voice recording with transcription
  - Email transcript feature

## Database Schema

The following tables are created:
- `profiles` - User profiles and preferences
- `expenses` - Transaction records
- `savings_goals` - Financial goals
- `ai_conversations` - Chat history
- `subscriptions` - Paystack subscription tracking
- `survival_calculations` - Burn rate calculations

All tables have Row Level Security (RLS) enabled.

## Next Steps

1. Configure OAuth providers in Supabase
2. Set up Paystack webhook endpoint for subscription renewals
3. Deploy to Vercel for production
4. Configure production environment variables
5. Test payment flows in Paystack test mode

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Production Checklist

- [ ] Update `NEXT_PUBLIC_APP_URL` to production domain
- [ ] Configure Paystack webhook URL in Paystack dashboard
- [ ] Test OAuth redirect URLs
- [ ] Enable Paystack live mode
- [ ] Setup monitoring (e.g., Sentry)

## Support

For issues or questions, check the README.md file or refer to the plan document.

