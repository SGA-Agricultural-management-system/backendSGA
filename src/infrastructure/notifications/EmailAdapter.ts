import { injectable } from 'tsyringe';
import { INotificationService } from '@application/ports/INotificationService';
import logger from '@shared/logger';

@injectable()
export class EmailAdapter implements INotificationService {
    async sendEmail(to: string, subject: string, body: string): Promise<void> {
        // Mock implementation: log to console
        logger.info({ to, subject }, 'Email sent (mock)');
    }
}