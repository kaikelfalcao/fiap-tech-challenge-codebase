import { EmailNotificationService } from '@domain/notification/email-notification.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class SmtpEmailService implements EmailNotificationService {
  async send(input: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void> {
    console.log('Sending email:', input);
  }
}
