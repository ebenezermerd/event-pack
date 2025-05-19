# EventEase

*Automatically synced with your [v0.dev](https://v0.dev) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/ebenezermerd-gmailcoms-projects/v0-event-ease)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/PLONkhiko8f)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/ebenezermerd-gmailcoms-projects/v0-event-ease](https://vercel.com/ebenezermerd-gmailcoms-projects/v0-event-ease)**

## Environment Variables

To run this project, you need to set up the following environment variables in your `.env.local` file:

### API Configuration
- `NEXT_PUBLIC_API_URL`: URL of your backend API (e.g., http://localhost:3000)

### Authentication
- `NEXT_PUBLIC_JWT_EXPIRATION`: JWT token expiration time (e.g., 1d)

### File Upload
- `NEXT_PUBLIC_MAX_FILE_SIZE`: Maximum file size for uploads in MB (e.g., 5)
- `NEXT_PUBLIC_UPLOAD_URL`: Upload endpoint URL (e.g., /api/upload)

### Application
- `NEXT_PUBLIC_APP_NAME`: Name of the application (e.g., EventEase)
- `NEXT_PUBLIC_APP_DESCRIPTION`: Description of the application

### AWS Configuration
- `AWS_REGION`: AWS region for S3 storage (e.g., us-east-1)
- `AWS_ACCESS_KEY_ID`: Your AWS access key ID
- `AWS_SECRET_ACCESS_KEY`: Your AWS secret access key
- `AWS_S3_BUCKET`: S3 bucket name for file uploads

### Payment Processing

#### Stripe (International Payments)
- `STRIPE_SECRET_KEY`: Stripe secret key for payment processing
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret for verifying webhook events

#### Chapa (Ethiopian Payments)
- `CHAPA_SECRET_KEY`: Chapa secret key for payment processing (e.g., CHASECK_TEST-xxxx)
- `CHAPA_PUBLIC_KEY`: Chapa public key for payment processing (e.g., CHAPUBK_TEST-xxxx)

### Caching
- `REDIS_URL`: URL for Redis connection (e.g., redis://localhost:6379)

## Payment Integration

### Chapa Payment Gateway

EventEase integrates with [Chapa](https://chapa.co), a payment gateway specifically designed for Ethiopian businesses. This allows users to pay using various Ethiopian payment methods including:

- Telebirr
- Commercial Bank of Ethiopia (CBE)
- Dashen Bank
- Awash Bank
- And other Ethiopian banks

To use Chapa in your development environment:

1. Sign up for a Chapa account at [https://chapa.co](https://chapa.co)
2. Get your API keys from the Chapa dashboard
3. Add the keys to your `.env.local` file
4. Install required dependencies:
   ```bash
   npm install axios uuid
   npm install --save-dev @types/uuid
   ```

#### Using the ChapaPaymentButton Component

The simplest way to integrate Chapa payments:

```tsx
import { ChapaPaymentButton } from '@/components/payment/chapa-payment-button';

export default function CheckoutPage() {
  return (
    <ChapaPaymentButton
      amount={1000}
      email="customer@example.com"
      firstName="John"
      lastName="Doe"
      phoneNumber="0911234567"
      description="Payment for Event Ticket"
      onSuccess={(data) => console.log('Payment initiated:', data)}
      onError={(error) => console.error('Payment error:', error)}
    />
  );
}
```

#### Using the useChapa Hook

For more control over the payment flow:

```tsx
import { useChapa } from '@/hooks/useChapa';
import { Button } from '@/components/ui/button';

export default function CheckoutPage() {
  const { loading, initiatePayment } = useChapa({
    onSuccess: (data) => console.log('Payment initiated:', data),
    onError: (error) => console.error('Payment error:', error),
  });

  const handlePayment = async () => {
    await initiatePayment({
      amount: 1000,
      email: "customer@example.com",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "0911234567",
      description: "Payment for Event Ticket",
    });
  };

  return (
    <Button onClick={handlePayment} disabled={loading}>
      {loading ? 'Processing...' : 'Pay with Chapa'}
    </Button>
  );
}
```

#### Verifying Payments

To verify payments after the user is redirected back:

```tsx
import { useRouter } from 'next/router';
import { useChapa } from '@/hooks/useChapa';

export default function VerifyPage() {
  const router = useRouter();
  const { tx_ref } = router.query;
  const { verifyPayment, loading } = useChapa();

  useEffect(() => {
    if (tx_ref) {
      verifyPayment(tx_ref as string)
        .then((response) => {
          if (response.status === 'success') {
            // Payment successful
          }
        })
        .catch((error) => {
          // Handle error
        });
    }
  }, [tx_ref, verifyPayment]);

  return (
    // Verification UI
  );
}
```

## Build your app  

Continue building your app on:

**[https://v0.dev/chat/projects/PLONkhiko8f](https://v0.dev/chat/projects/PLONkhiko8f)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository