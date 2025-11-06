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

## Edge Functions (Future)

Edge Functions for Paystack webhooks can be added in the `functions/` directory.

## Row Level Security

All tables have RLS policies that ensure users can only access their own data. The policies are defined in the migration file.

