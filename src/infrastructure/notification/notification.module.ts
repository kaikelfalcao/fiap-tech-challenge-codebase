import { SmtpEmailService } from '@infrastructure/email/smtp-email.service';
import { ServiceOrderApprovalEmailNotifier } from './email/service-order-approval-email.notifier';
import { Module } from '@nestjs/common';
import { CustomerModule } from '@interface/http/controllers/customer/customer.module';

@Module({
  imports: [CustomerModule],
  providers: [
    ServiceOrderApprovalEmailNotifier,
    {
      provide: 'ServiceOrderApprovalNotifier',
      useExisting: ServiceOrderApprovalEmailNotifier,
    },
    {
      provide: 'EmailNotificationService',
      useClass: SmtpEmailService,
    },
  ],
  exports: ['ServiceOrderApprovalNotifier'],
})
export class NotificationModule {}
