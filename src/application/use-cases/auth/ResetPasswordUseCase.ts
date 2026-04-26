import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordService } from '@application/ports/IPasswordService';
import { ICacheService } from '@application/ports/ICacheService';
import { Result } from '@shared/result/Result';
import { ValidationError } from '@domain/errors/ValidationError';
import { Password } from '@domain/value-objects/Password';

@injectable()
export class ResetPasswordUseCase {
    constructor(
        @inject('IUserRepository') private userRepo: IUserRepository,
        @inject('IPasswordService') private passwordService: IPasswordService,
        @inject('ICacheService') private cache: ICacheService,
    ) { }

    async execute(token: string, newPassword: string): Promise<Result<void, ValidationError>> {
        const passwordResult = Password.create(newPassword);
        if (passwordResult.isFailure) return Result.fail(passwordResult.error);

        const userId = await this.cache.get(`reset:${token}`);
        if (!userId) {
            return Result.fail(new ValidationError('Invalid or expired reset token'));
        }

        const userOptional = await this.userRepo.findById(userId);
        if (!userOptional.hasValue) {
            return Result.fail(new ValidationError('Invalid token'));
        }

        const hashedPassword = await this.passwordService.hash(passwordResult.value.value);
        const user = userOptional.value;

        // Crear un nuevo user con password actualizado
        const { User } = require('@domain/entities/User');
        const updatedUser = User.create({
            ...user,
            hashedPassword,
        });

        await this.userRepo.update(updatedUser);
        await this.cache.del(`reset:${token}`);

        return Result.ok(undefined);
    }
}