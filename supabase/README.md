# Supabase Setup

## Running Migrations

1. Install Supabase CLI (optional, for local development):
```bash
npm install -g supabase
```

2. Link to your Supabase project:
```bash
supabase link --project-ref your-project-ref
```

3. Run migrations:
```bash
supabase db push
```

Or manually run the SQL in `migrations/001_initial_schema.sql` in your Supabase SQL Editor.

## Edge Functions

### Paystack Webhook Handler

A Paystack webhook handler is implemented at `functions/payment-webhook/`.

**Deployment:**

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login and link your project:
```bash
supabase login
supabase link --project-ref your-project-ref
```

3. Set environment variables:
```bash
supabase secrets set PAYSTACK_SECRET_KEY=your_secret_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

4. Deploy:
```bash
supabase functions deploy payment-webhook
```

**Webhook URL:** `https://your-project-ref.supabase.co/functions/v1/payment-webhook`

For detailed setup instructions, see `functions/payment-webhook/README.md`.

## Row Level Security

All tables have RLS policies that ensure users can only access their own data. The policies are defined in the migration file.

