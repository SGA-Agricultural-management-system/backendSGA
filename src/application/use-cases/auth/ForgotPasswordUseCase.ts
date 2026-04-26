import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ICacheService } from '@application/ports/ICacheService';
import { INotificationService } from '@application/ports/INotificationService';
import { Result } from '@shared/result/Result';
import crypto from 'crypto';

@injectable()
export class ForgotPasswordUseCase {
    constructor(
        @inject('IUserRepository') private userRepo: IUserRepository,
        @inject('ICacheService') private cache: ICacheService,
        @inject('INotificationService') private notification: INotificationService,
    ) { }

    async execute(email: string): Promise<Result<void>> {
        const userOptional = await this.userRepo.findByEmail(email);
        if (!userOptional.hasValue) {
            // No revelar si el email existe
            return Result.ok(undefined);
        }

        const token = crypto.randomBytes(32).toString('hex');
        // Guardar token en Redis con TTL de 1 hora
        await this.cache.set(`reset:${token}`, userOptional.value.id, 3600);
        await this.notification.sendEmail(email, 'Password Reset', `Your reset token: ${token}`);

        return Result.ok(undefined);
    }
}