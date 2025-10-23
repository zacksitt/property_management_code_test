# External Services Architecture

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Your Application Layer                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Properties   │  │   Tasks      │  │   Users      │          │
│  │   Module     │  │   Module     │  │   Module     │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                  │                   │
│         └─────────────────┼──────────────────┘                   │
│                           │                                      │
│                           ▼                                      │
│         ┌─────────────────────────────────────┐                 │
│         │   External Services Module          │                 │
│         │  ┌──────────────────────────────┐  │                 │
│         │  │  Payment Service             │  │                 │
│         │  ├──────────────────────────────┤  │                 │
│         │  │  Notification Service        │  │                 │
│         │  ├──────────────────────────────┤  │                 │
│         │  │  Geocoding Service           │  │                 │
│         │  └──────────────────────────────┘  │                 │
│         └──────────────┬──────────────────────┘                 │
│                        │                                         │
└────────────────────────┼─────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
          ▼              ▼              ▼
   ┌──────────┐   ┌──────────┐   ┌──────────┐
   │ Payment  │   │Notification│  │Geocoding│
   │ Provider │   │  Provider  │  │ Provider │
   │  (Stripe)│   │ (SendGrid) │  │ (Google) │
   └──────────┘   └──────────┘   └──────────┘
```

## 🏗️ Component Layers

### 1. Base Layer - Common Infrastructure

```
common/
├── base-http-client.service.ts  ← All services extend this
├── errors/
│   └── external-service.error.ts  ← Custom error classes
└── interfaces/
    └── http-client-config.interface.ts  ← Shared interfaces
```

**Responsibilities:**
- HTTP client configuration
- Retry logic with exponential backoff
- Request/Response interceptors
- Error handling and transformation
- Logging

**Key Features:**
- ✅ Automatic retries (configurable)
- ✅ Request timeout management
- ✅ Consistent error handling
- ✅ Structured logging
- ✅ Type-safe responses

### 2. Service Layer - Individual Integrations

Each service follows this structure:

```
service-name/
├── service-name.service.ts     ← Main service implementation
├── dto/                        ← Data Transfer Objects
│   ├── request.dto.ts
│   └── response.dto.ts
├── interfaces/                 ← Interface contracts
│   └── service.interface.ts
└── documentation/              ← API-specific docs
    └── implementation-notes.md
```

**Example Services:**

#### Payment Service
```typescript
class PaymentService extends BaseHttpClientService {
  - createPayment()
  - refundPayment()
  - getPaymentStatus()
  - verifyWebhook()
}
```

#### Notification Service
```typescript
class NotificationService extends BaseHttpClientService {
  - sendEmail()
  - sendSms()
  - sendBulkSms()
  - sendTemplatedEmail()
}
```

#### Geocoding Service
```typescript
class GeocodingService extends BaseHttpClientService {
  - geocodeAddress()
  - reverseGeocode()
  - getDistanceMatrix()
  - validateAddress()
}
```

## 🔄 Request Flow

```
1. Application Code
   │
   ├─► Call Service Method
   │   (e.g., paymentService.createPayment())
   │
2. Service Layer
   │
   ├─► Validate Input
   ├─► Transform to API Format
   ├─► Call BaseHttpClient
   │
3. Base HTTP Client
   │
   ├─► Add Headers/Auth
   ├─► Set Timeout
   ├─► Send Request
   │   │
   │   ├─► SUCCESS ──► Return Data
   │   │
   │   └─► FAILURE ──► Retry Logic
   │                   │
   │                   ├─► Retry (if eligible)
   │                   │
   │                   └─► Transform Error
   │                       │
4. Error Handling         │
   │                       │
   ├─► Classify Error ◄────┘
   ├─► Log Error
   └─► Throw Custom Error
       │
5. Application Code
   │
   └─► Catch & Handle Error
```

## 🎯 Design Patterns

### 1. **Template Method Pattern**
`BaseHttpClientService` provides the template for all HTTP operations.

### 2. **Strategy Pattern**
Different retry strategies (linear, exponential backoff).

### 3. **Adapter Pattern**
Each service adapts external API to application's needs.

### 4. **Factory Pattern**
Services create DTOs from external API responses.

## 🔐 Security Architecture

```
┌─────────────────────────────────────────┐
│         Security Layers                 │
├─────────────────────────────────────────┤
│ 1. Environment Variables                │
│    - API keys stored in .env            │
│    - Never committed to repo            │
├─────────────────────────────────────────┤
│ 2. ConfigService                        │
│    - Centralized config management      │
│    - Validation at startup              │
├─────────────────────────────────────────┤
│ 3. HTTPS Only                           │
│    - All external calls use TLS         │
│    - Certificate validation             │
├─────────────────────────────────────────┤
│ 4. Webhook Verification                 │
│    - HMAC signature validation          │
│    - Timing-safe comparison             │
├─────────────────────────────────────────┤
│ 5. Input Validation                     │
│    - DTO validation with class-validator│
│    - Sanitization before sending        │
└─────────────────────────────────────────┘
```

## 📊 Error Handling Strategy

```
External API Error
    │
    ├─► Timeout? ──────► ExternalServiceTimeoutError
    │
    ├─► 401/403? ──────► ExternalServiceAuthError
    │
    ├─► 429? ───────────► ExternalServiceRateLimitError
    │
    ├─► 503/504? ──────► ExternalServiceUnavailableError
    │
    └─► Other? ────────► ExternalServiceError
            │
            ├─► 4xx (Client Error)
            │   └─► Don't Retry
            │
            └─► 5xx (Server Error)
                └─► Retry with Backoff
```

## 🚀 Performance Optimizations

### 1. Connection Pooling
Axios reuses HTTP connections for better performance.

### 2. Retry with Exponential Backoff
```
Attempt 1: Immediate
Attempt 2: Wait 1s
Attempt 3: Wait 2s
Attempt 4: Wait 4s
Max Wait: 10s
```

### 3. Request Timeouts
Prevent hanging requests:
- Payment: 30s
- Notification: 15s
- Geocoding: 10s

### 4. Caching (Future Enhancement)
```typescript
// Example: Cache geocoding results
@Injectable()
export class CachedGeocodingService {
  constructor(
    private geocoding: GeocodingService,
    private cache: CacheManager,
  ) {}

  async geocodeAddress(address: string) {
    const cached = await this.cache.get(address);
    if (cached) return cached;

    const result = await this.geocoding.geocodeAddress(address);
    await this.cache.set(address, result, 86400); // 24h
    return result;
  }
}
```

## 📈 Monitoring & Observability

### Logging Levels
```typescript
this.logger.debug()  // Request/Response details
this.logger.log()    // Successful operations
this.logger.warn()   // Retries, degraded performance
this.logger.error()  // Failed operations
```

### Metrics to Track
- Request count by service
- Average response time
- Error rate
- Retry rate
- Timeout rate

### Example Logging Output
```
[PaymentService] Creating payment for property prop_123, amount: 1000 USD
[PaymentService] [POST] /v1/payments
[PaymentService] [201] POST /v1/payments - Created
[PaymentService] Payment created successfully: pay_abc123
```

## 🧪 Testing Strategy

### 1. Unit Tests
Mock external services completely:
```typescript
const mockPaymentService = {
  createPayment: jest.fn().mockResolvedValue({ id: 'pay_123' }),
};
```

### 2. Integration Tests
Use test/sandbox APIs:
```typescript
// Use real service but with sandbox credentials
PAYMENT_API_URL=https://sandbox.stripe.com
```

### 3. E2E Tests
Test full flow including webhooks:
```typescript
// Trigger webhook from sandbox
// Verify application response
```

## 🔄 Adding a New Service

### Step-by-Step Guide

1. **Create Directory Structure**
```bash
mkdir -p src/external-services/new-service/{dto,interfaces,documentation}
```

2. **Create Service Class**
```typescript
export class NewService extends BaseHttpClientService {
  constructor(configService: ConfigService) {
    super({
      baseURL: configService.get('NEW_SERVICE_URL'),
      timeout: 30000,
    }, 'NewService');
  }
}
```

3. **Create DTOs**
```typescript
export class NewServiceRequestDto { }
export class NewServiceResponseDto { }
```

4. **Register in Module**
```typescript
@Module({
  providers: [NewService],
  exports: [NewService],
})
```

5. **Add Configuration**
```bash
# .env
NEW_SERVICE_URL=...
NEW_SERVICE_API_KEY=...
```

6. **Write Tests**
```typescript
describe('NewService', () => {
  // Unit tests
});
```

## 📚 Best Practices

1. ✅ **Always extend BaseHttpClientService**
2. ✅ **Use DTOs for type safety**
3. ✅ **Implement interfaces for flexibility**
4. ✅ **Log all external operations**
5. ✅ **Handle errors gracefully**
6. ✅ **Use environment variables for config**
7. ✅ **Validate webhook signatures**
8. ✅ **Write comprehensive tests**
9. ✅ **Document service-specific behavior**
10. ✅ **Monitor external service health**

