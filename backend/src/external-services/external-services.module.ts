import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';


/**
 * External Services Module
 * 
 * This module consolidates all third-party API integrations.
 * Each service is self-contained and can be used independently.
 * 
 * Usage:
 * 1. Import this module in your feature module
 * 2. Inject the required service in your class
 * 
 * @example
 * ```typescript
 * @Module({
 *   imports: [ExternalServicesModule],
 * })
 * export class PropertiesModule {}
 * 
 * @Injectable()
 * export class PropertiesService {
 *   constructor(
 *     private readonly paymentService: PaymentService,
 *     private readonly notificationService: NotificationService,
 *   ) {}
 * }
 * ```
 */
@Module({
  imports: [ConfigModule],
  providers: [

  ],
  exports: [

  ],
})
export class ExternalServicesModule {}

