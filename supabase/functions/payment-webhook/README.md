# Paystack Webhook Handler

This Supabase Edge Function handles Paystack webhook events for subscription management.

## Supported Events

- `charge.success` - When a payment is successfully completed
- `subscription.create` - When a subscription is created
- `subscription.disable` - When a subscription is cancelled
- `invoice.payment_failed` - When a subscription payment fails

## Environment Variables

The following environment variables must be set in your Supabase project:

- `PAYSTACK_SECRET_KEY` - Your Paystack secret key (for webhook signature verification)
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (bypasses RLS)

## Deployment

### Using Supabase CLI

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project:
```bash
supabase link --project-ref your-project-ref
```

4. Set environment variables:
```bash
supabase secrets set PAYSTACK_SECRET_KEY=your_secret_key
supabase secrets set SUPABASE_URL=your_supabase_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

5. Deploy the function:
```bash
supabase functions deploy payment-webhook
```

### Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to Edge Functions
3. Create a new function named `payment-webhook`
4. Copy the code from `index.ts`
5. Set the environment variables in the function settings

## Paystack Configuration

1. Go to your Paystack Dashboard
2. Navigate to Settings → Webhooks
3. Add webhook URL: `https://your-project-ref.supabase.co/functions/v1/payment-webhook`
4. Select the following events:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`
   - `invoice.payment_failed`

## How It Works

1. Paystack sends a webhook event to this function
2. The function verifies the webhook signature using HMAC SHA-512
3. Based on the event type, it updates the `subscriptions` table in your database
4. Returns appropriate HTTP status codes to Paystack

## Security

- All webhook requests are verified using Paystack's signature
- Invalid signatures are rejected with a 401 status
- The function uses Supabase service role key to bypass RLS for database updates

## Testing

You can test the webhook using Paystack's test webhook feature or by sending test events from the Paystack dashboard.

