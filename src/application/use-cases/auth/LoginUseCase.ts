import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { IPasswordService } from '@application/ports/IPasswordService';
import { ITokenService } from '@application/ports/ITokenService';
import { Result } from '@shared/result/Result';
import { AuthenticationError } from '@domain/errors/AuthenticationError';
import { LoginRequest, AuthResponse } from '@application/dtos/AuthDTO';
import { User } from '@domain/entities/User';
import { Email } from '@domain/value-objects/Email';
import { Password } from '@domain/value-objects/Password';

@injectable()
export class LoginUseCase {
    constructor(
        @inject('IUserRepository') private userRepo: IUserRepository,
        @inject('IPasswordService') private passwordService: IPasswordService,
        @inject('ITokenService') private tokenService: ITokenService,
    ) { }

    async execute(request: LoginRequest): Promise<Result<AuthResponse, AuthenticationError>> {
        const emailResult = Email.create(request.email);
        if (emailResult.isFailure) {
            return Result.fail(new AuthenticationError('Invalid email format'));
        }

        const userOptional = await this.userRepo.findByEmail(emailResult.value.value);
        if (!userOptional.hasValue) {
            return Result.fail(new AuthenticationError('Invalid credentials'));
        }

        const user = userOptional.value;
        const passwordMatch = await this.passwordService.compare(request.password, user.hashedPassword);
        if (!passwordMatch) {
            return Result.fail(new AuthenticationError('Invalid credentials'));
        }

        const tokens = await this.tokenService.generateTokens({
            userId: user.id,
            role: user.role,
        });

        await this.userRepo.saveRefreshToken(user.id, this.tokenService.hashToken(tokens.refreshToken));

        return Result.ok({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            user: user.toJSON(),
        });
    }
}