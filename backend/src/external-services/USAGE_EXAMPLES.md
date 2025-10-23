## Usage Examples

This document provides practical examples of how to use the external services in your application.

### 1. Payment Service

#### Create a Payment

```typescript
import { Injectable } from '@nestjs/common';
import { PaymentService } from '../external-services/payment/payment.service';
import { CreatePaymentDto } from '../external-services/payment/dto/payment-request.dto';

@Injectable()
export class BillingService {
  constructor(private readonly paymentService: PaymentService) {}

  async processRentPayment(propertyId: string, tenantId: string, amount: number) {
    try {
      const paymentData: CreatePaymentDto = {
        amount,
        currency: 'USD',
        propertyId,
        tenantId,
        description: `Rent payment for property ${propertyId}`,
        metadata: {
          paymentType: 'rent',
          month: new Date().toISOString().slice(0, 7), // YYYY-MM
        },
      };

      const payment = await this.paymentService.createPayment(paymentData);

      console.log(`Payment created: ${payment.id}, Status: ${payment.status}`);
      return payment;
    } catch (error) {
      console.error('Payment failed:', error.message);
      throw error;
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    const refund = await this.paymentService.refundPayment({
      paymentId,
      amount, // Optional: partial refund
      reason: 'Customer request',
    });

    return refund;
  }

  async checkPaymentStatus(paymentId: string) {
    const status = await this.paymentService.getPaymentStatus({ paymentId });
    return status;
  }
}
```

#### Handle Payment Webhooks

```typescript
import { Controller, Post, Body, Headers, BadRequestException } from '@nestjs/common';
import { PaymentService } from '../external-services/payment/payment.service';

@Controller('webhooks/payment')
export class PaymentWebhookController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post()
  async handleWebhook(
    @Body() payload: any,
    @Headers('x-signature') signature: string,
  ) {
    // Verify webhook signature
    const isValid = this.paymentService.verifyWebhook(payload, signature);
    
    if (!isValid) {
      throw new BadRequestException('Invalid signature');
    }

    // Process webhook event
    switch (payload.event) {
      case 'payment.completed':
        await this.handlePaymentCompleted(payload.data);
        break;
      case 'payment.failed':
        await this.handlePaymentFailed(payload.data);
        break;
      case 'refund.completed':
        await this.handleRefundCompleted(payload.data);
        break;
    }

    return { received: true };
  }

  private async handlePaymentCompleted(data: any) {
    console.log('Payment completed:', data);
    // Update your database, send notifications, etc.
  }

  private async handlePaymentFailed(data: any) {
    console.log('Payment failed:', data);
    // Notify user, update status, etc.
  }

  private async handleRefundCompleted(data: any) {
    console.log('Refund completed:', data);
    // Update records, notify user, etc.
  }
}
```

### 2. Notification Service

#### Send Email Notifications

```typescript
import { Injectable } from '@nestjs/common';
import { NotificationService } from '../external-services/notification/notification.service';

@Injectable()
export class UserNotificationService {
  constructor(private readonly notificationService: NotificationService) {}

  async sendWelcomeEmail(userEmail: string, userName: string) {
    await this.notificationService.sendEmail({
      to: userEmail,
      subject: 'Welcome to Property Management System',
      body: `
        <h1>Welcome ${userName}!</h1>
        <p>Thank you for joining our property management platform.</p>
        <p>Get started by adding your first property.</p>
      `,
    });
  }

  async sendRentReminder(tenantEmail: string, amount: number, dueDate: Date) {
    await this.notificationService.sendEmail({
      to: tenantEmail,
      subject: 'Rent Payment Reminder',
      body: `
        <h2>Rent Payment Due</h2>
        <p>Your rent payment of $${amount} is due on ${dueDate.toLocaleDateString()}.</p>
        <p><a href="https://yourapp.com/pay">Pay Now</a></p>
      `,
    });
  }

  async sendMaintenanceAlert(ownerEmail: string, propertyName: string, issue: string) {
    await this.notificationService.sendEmail({
      to: ownerEmail,
      subject: `Maintenance Request - ${propertyName}`,
      body: `
        <h2>New Maintenance Request</h2>
        <p><strong>Property:</strong> ${propertyName}</p>
        <p><strong>Issue:</strong> ${issue}</p>
        <p><a href="https://yourapp.com/maintenance">View Details</a></p>
      `,
    });
  }
}
```

#### Send SMS Notifications

```typescript
@Injectable()
export class AlertService {
  constructor(private readonly notificationService: NotificationService) {}

  async sendUrgentAlert(phoneNumber: string, message: string) {
    await this.notificationService.sendSms({
      to: phoneNumber,
      message: `URGENT: ${message}`,
    });
  }

  async send2FACode(phoneNumber: string, code: string) {
    await this.notificationService.sendSms({
      to: phoneNumber,
      message: `Your verification code is: ${code}. Valid for 10 minutes.`,
    });
  }

  async sendBulkAlert(phoneNumbers: string[], message: string) {
    await this.notificationService.sendBulkSms(phoneNumbers, message);
  }
}
```

### 3. Geocoding Service

#### Validate Property Address

```typescript
import { Injectable } from '@nestjs/common';
import { GeocodingService } from '../external-services/geocoding/geocoding.service';

@Injectable()
export class PropertyLocationService {
  constructor(private readonly geocodingService: GeocodingService) {}

  async validatePropertyAddress(address: string, city: string, state: string) {
    const validation = await this.geocodingService.validateAddress({
      address,
      city,
      state,
      country: 'US',
    });

    if (!validation.valid) {
      throw new Error('Invalid address');
    }

    return {
      ...validation.formatted,
      isValid: true,
    };
  }

  async getPropertyCoordinates(address: string) {
    const geocoded = await this.geocodingService.geocodeAddress({
      address,
    });

    return {
      latitude: geocoded.latitude,
      longitude: geocoded.longitude,
      formattedAddress: geocoded.formattedAddress,
    };
  }

  async findNearbyProperties(latitude: number, longitude: number) {
    // Get address from coordinates
    const location = await this.geocodingService.reverseGeocode({
      latitude,
      longitude,
    });

    console.log('Location:', location.formattedAddress);
    
    // Then query your database for nearby properties
    // using the coordinates
  }
}
```

#### Calculate Distance Between Properties

```typescript
@Injectable()
export class PropertyDistanceService {
  constructor(private readonly geocodingService: GeocodingService) {}

  async calculateDistanceBetweenProperties(
    property1: { lat: number; lng: number },
    property2: { lat: number; lng: number },
  ) {
    const result = await this.geocodingService.getDistanceMatrix({
      origins: [property1],
      destinations: [property2],
      mode: 'driving',
    });

    const distanceInMeters = result.distances[0][0];
    const durationInSeconds = result.durations[0][0];

    return {
      distance: {
        meters: distanceInMeters,
        kilometers: distanceInMeters / 1000,
        miles: distanceInMeters / 1609.34,
      },
      duration: {
        seconds: durationInSeconds,
        minutes: Math.round(durationInSeconds / 60),
      },
    };
  }

  async findPropertiesWithinRadius(
    centerProperty: { lat: number; lng: number },
    otherProperties: Array<{ id: string; lat: number; lng: number }>,
    radiusKm: number,
  ) {
    const result = await this.geocodingService.getDistanceMatrix({
      origins: [centerProperty],
      destinations: otherProperties.map(p => ({ lat: p.lat, lng: p.lng })),
      mode: 'driving',
    });

    const distances = result.distances[0];
    const radiusMeters = radiusKm * 1000;

    return otherProperties.filter((property, index) => {
      return distances[index] <= radiusMeters && distances[index] > 0;
    });
  }
}
```

### 4. Error Handling

#### Global Error Handler

```typescript
import { Catch, ExceptionFilter, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import {
  ExternalServiceError,
  ExternalServiceTimeoutError,
  ExternalServiceAuthError,
  ExternalServiceRateLimitError,
} from '../external-services/common/errors/external-service.error';

@Catch(ExternalServiceError)
export class ExternalServiceExceptionFilter implements ExceptionFilter {
  catch(exception: ExternalServiceError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An error occurred with external service';

    if (exception instanceof ExternalServiceTimeoutError) {
      status = HttpStatus.REQUEST_TIMEOUT;
      message = 'External service request timed out';
    } else if (exception instanceof ExternalServiceAuthError) {
      status = HttpStatus.UNAUTHORIZED;
      message = 'External service authentication failed';
    } else if (exception instanceof ExternalServiceRateLimitError) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = 'Rate limit exceeded';
    }

    response.status(status).json({
      statusCode: status,
      message,
      service: exception.serviceName,
      timestamp: new Date().toISOString(),
    });
  }
}
```

### 5. Testing

#### Mock External Services

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentService } from '../external-services/payment/payment.service';
import { BillingService } from './billing.service';

describe('BillingService', () => {
  let billingService: BillingService;
  let paymentService: PaymentService;

  const mockPaymentService = {
    createPayment: jest.fn(),
    refundPayment: jest.fn(),
    getPaymentStatus: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PaymentService,
          useValue: mockPaymentService,
        },
      ],
    }).compile();

    billingService = module.get<BillingService>(BillingService);
    paymentService = module.get<PaymentService>(PaymentService);
  });

  it('should create a payment successfully', async () => {
    const mockPayment = {
      id: 'pay_123',
      amount: 1000,
      currency: 'USD',
      status: 'COMPLETED',
    };

    mockPaymentService.createPayment.mockResolvedValue(mockPayment);

    const result = await billingService.processRentPayment('prop_1', 'tenant_1', 1000);

    expect(result).toEqual(mockPayment);
    expect(mockPaymentService.createPayment).toHaveBeenCalledWith(
      expect.objectContaining({
        amount: 1000,
        currency: 'USD',
        propertyId: 'prop_1',
        tenantId: 'tenant_1',
      }),
    );
  });
});
```

