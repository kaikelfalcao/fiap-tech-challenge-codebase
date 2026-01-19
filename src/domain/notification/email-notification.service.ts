export interface EmailNotificationService {
  send(input: { to: string; subject: string; body: string }): Promise<void>;
}
