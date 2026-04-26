import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordService } from '@application/ports/IPasswordService';
import { ITokenService } from '@application/ports/ITokenService';
import { Result } from '@shared/result/Result';
import { ValidationError } from '@domain/errors/ValidationError';
import { ConflictError } from '@domain/errors/ConflictError';
import { RegisterRequest, AuthResponse } from '@application/dtos/AuthDTO';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';
import { v4 as uuid } from 'uuid';

@injectable()
export class RegisterUseCase {
    constructor(
        @inject('IUserRepository') private userRepo: IUserRepository,
        @inject('IPasswordService') private passwordService: IPasswordService,
        @inject('ITokenService') private tokenService: ITokenService,
    ) { }

    async execute(request: RegisterRequest): Promise<Result<AuthResponse, ValidationError | ConflictError>> {
        const emailResult = Email.create(request.email);
        if (emailResult.isFailure) return Result.fail(emailResult.error);

        const passwordResult = Password.create(request.password);
        if (passwordResult.isFailure) return Result.fail(passwordResult.error);

        const existingUser = await this.userRepo.findByEmail(emailResult.value.value);
        if (existingUser.hasValue) {
            return Result.fail(new ConflictError('Email already registered'));
        }

        const hashedPassword = await this.passwordService.hash(passwordResult.value.value);

        const user = User.create({
            id: uuid(),
            name: request.name.trim(),
            email: emailResult.value.value,
            hashedPassword,
            role: 'farmer',
            farmName: request.farm_name?.trim(),
        });

        const savedUser = await this.userRepo.create(user);

        const tokens = await this.tokenService.generateTokens({
            userId: savedUser.id,
            role: savedUser.role,
        });

        await this.userRepo.saveRefreshToken(savedUser.id, this.tokenService.hashToken(tokens.refreshToken));

        return Result.ok({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            user: savedUser.toJSON(),
        });
    }
}