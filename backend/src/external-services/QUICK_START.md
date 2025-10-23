# Quick Start Guide - External Services

Get started with third-party API integrations in 5 minutes!

## 📦 Installation

The structure is already set up. You just need to:

### 1. Install Required Dependencies

```bash
npm install axios @nestjs/config
```

Or if using yarn:
```bash
yarn add axios @nestjs/config
```

### 2. Configure Environment Variables

Copy the example configuration and add your API keys:

```bash
# Add to your .env file
PAYMENT_API_URL=https://api.stripe.com
PAYMENT_API_KEY=sk_test_your_key_here
PAYMENT_WEBHOOK_SECRET=whsec_your_secret_here

NOTIFICATION_API_URL=https://api.sendgrid.com
NOTIFICATION_API_KEY=SG.your_key_here
SMS_FROM_NUMBER=+1234567890
EMAIL_FROM_ADDRESS=noreply@yourapp.com

GEOCODING_API_URL=https://maps.googleapis.com/maps/api
GEOCODING_API_KEY=AIza_your_key_here
```

See `ENV_CONFIG_EXAMPLE.md` for full configuration options.

### 3. Import the Module

In your `app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ExternalServicesModule } from './external-services/external-services.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ExternalServicesModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## 🚀 Using the Services

### Example 1: Process a Payment

```typescript
import { Injectable } from '@nestjs/common';
import { PaymentService } from '../external-services/payment/payment.service';

@Injectable()
export class BillingService {
  constructor(private readonly paymentService: PaymentService) {}

  async chargeRent(propertyId: string, amount: number) {
    const payment = await this.paymentService.createPayment({
      amount,
      currency: 'USD',
      propertyId,
      tenantId: 'tenant_123',
      description: 'Monthly rent payment',
    });

    return payment;
  }
}
```

### Example 2: Send Notification

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../external-services/notification/notification.service';

@Injectable()
export class AlertService {
  constructor(private readonly notificationService: NotificationService) {}

  async sendPaymentReceipt(email: string, amount: number) {
    await this.notificationService.sendEmail({
      to: email,
      subject: 'Payment Received',
      body: `Your payment of $${amount} has been processed successfully.`,
    });
  }
}
```

### Example 3: Validate Address

```typescript
import { Injectable } from '@nestjs/common';
import { GeocodingService } from '../external-services/geocoding/geocoding.service';

@Injectable()
export class PropertyService {
  constructor(private readonly geocodingService: GeocodingService) {}

  async addProperty(address: string) {
    const validation = await this.geocodingService.validateAddress({
      address,
    });

    if (!validation.valid) {
      throw new Error('Invalid address');
    }

    // Save property with validated coordinates
    return {
      address: validation.formatted.formattedAddress,
      latitude: validation.formatted.latitude,
      longitude: validation.formatted.longitude,
    };
  }
}
```

## 🧪 Testing Your Integration

### 1. Unit Test with Mocks

```typescript
describe('BillingService', () => {
  let service: BillingService;

  const mockPaymentService = {
    createPayment: jest.fn().mockResolvedValue({
      id: 'pay_test',
      status: 'COMPLETED',
    }),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BillingService,
        { provide: PaymentService, useValue: mockPaymentService },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should process payment', async () => {
    const result = await service.chargeRent('prop_1', 1000);
    expect(result.status).toBe('COMPLETED');
  });
});
```

### 2. Test with Sandbox API

Use test credentials to make real API calls in development:

```bash
# .env.development
PAYMENT_API_URL=https://api.sandbox.stripe.com
PAYMENT_API_KEY=sk_test_sandbox_key
```

## 🔧 Troubleshooting

### Issue: Timeout Errors

**Solution:** Increase timeout in environment variables
```bash
PAYMENT_API_TIMEOUT=60000  # 60 seconds
```

### Issue: Authentication Failed

**Solution:** Verify API keys are correct
```typescript
// Check if API key is loaded
console.log('API Key:', process.env.PAYMENT_API_KEY?.substring(0, 10) + '...');
```

### Issue: Webhook Signature Invalid

**Solution:** Ensure webhook secret matches provider configuration
```typescript
// Payment webhook handler
verifyWebhook(payload, signature) {
  // This must match the secret from your provider dashboard
}
```

## 📁 Project Structure Overview

```
external-services/
├── README.md                    # Main documentation
├── ARCHITECTURE.md              # Architecture details
├── USAGE_EXAMPLES.md            # Code examples
├── ENV_CONFIG_EXAMPLE.md        # Environment config
├── QUICK_START.md              # This file
│
├── external-services.module.ts  # Main module
│
├── common/                      # Shared infrastructure
│   ├── base-http-client.service.ts
│   ├── errors/
│   └── interfaces/
│
├── payment/                     # Payment integration
│   ├── payment.service.ts
│   ├── dto/
│   └── interfaces/
│
├── notification/                # Notification integration
│   ├── notification.service.ts
│   └── dto/
│
└── geocoding/                   # Geocoding integration
    ├── geocoding.service.ts
    └── dto/
```

## 🎯 Next Steps

1. **Read the Documentation**
   - `README.md` - Overview and guidelines
   - `ARCHITECTURE.md` - Detailed architecture
   - `USAGE_EXAMPLES.md` - More code examples

2. **Add Your First Integration**
   - Choose a service (payment, notification, or geocoding)
   - Get API credentials from the provider
   - Update `.env` file
   - Start using the service

3. **Create Custom Services**
   - Follow the pattern in existing services
   - Extend `BaseHttpClientService`
   - Add DTOs and interfaces
   - Register in `external-services.module.ts`

## 💡 Tips

- **Start with Sandbox/Test APIs** - Always test with non-production credentials first
- **Monitor Logs** - Check application logs for request/response details
- **Handle Errors** - Use try-catch blocks and provide user-friendly error messages
- **Use TypeScript** - Take advantage of type safety with DTOs
- **Test Webhooks Locally** - Use tools like ngrok or webhook.site
- **Keep Credentials Secure** - Never commit `.env` files

## 📞 Support

For service-specific issues:
- Payment Service → Check provider documentation (Stripe, PayPal, etc.)
- Notification Service → Check provider documentation (SendGrid, Twilio, etc.)
- Geocoding Service → Check provider documentation (Google Maps, Mapbox, etc.)

For architecture questions:
- See `ARCHITECTURE.md` for design patterns
- See `USAGE_EXAMPLES.md` for implementation patterns

## ✅ Checklist

Before going to production:

- [ ] Replace all test/sandbox credentials with production credentials
- [ ] Set appropriate timeouts for your use case
- [ ] Configure retry attempts based on your needs
- [ ] Set up webhook endpoints for async notifications
- [ ] Add monitoring and alerting
- [ ] Test error handling scenarios
- [ ] Review security settings (HTTPS, API key rotation)
- [ ] Document any custom configurations
- [ ] Set up rate limiting if needed
- [ ] Configure logging level for production

## 🚀 You're Ready!

You now have a production-ready structure for integrating with any third-party API. Happy coding!

