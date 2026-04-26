import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordService } from '@application/ports/IPasswordService';
import { Result } from '@shared/result/Result';
import { AuthenticationError } from '@domain/errors/AuthenticationError';
import { ValidationError } from '@domain/errors/ValidationError';
import { Password } from '@domain/value-objects/Password';
import { User } from '@domain/entities/User';

@injectable()
export class ChangePasswordUseCase {
    constructor(
        @inject('IUserRepository') private userRepo: IUserRepository,
        @inject('IPasswordService') private passwordService: IPasswordService,
    ) { }

    async execute(userId: string, currentPassword: string, newPassword: string): Promise<Result<void, AuthenticationError | ValidationError>> {
        const userOptional = await this.userRepo.findById(userId);
        if (!userOptional.hasValue) return Result.fail(new AuthenticationError('User not found'));

        const user = userOptional.value;
        const match = await this.passwordService.compare(currentPassword, user.hashedPassword);
        if (!match) return Result.fail(new AuthenticationError('Current password is incorrect'));

        const passwordResult = Password.create(newPassword);
        if (passwordResult.isFailure) return Result.fail(passwordResult.error);

        const newHash = await this.passwordService.hash(passwordResult.value.value);
        const updated = User.create({ ...user, hashedPassword: newHash });
        await this.userRepo.update(updated);

        return Result.ok(undefined);
    }
}