import { inject, injectable } from 'tsyringe';
import { ITokenService } from '@application/ports/ITokenService';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@shared/result/Result';
import { AuthenticationError } from '@domain/errors/AuthenticationError';
import { RefreshResponse } from '@application/dtos/AuthDTO';

@injectable()
export class RefreshTokenUseCase {
    constructor(
        @inject('ITokenService') private tokenService: ITokenService,
        @inject('IUserRepository') private userRepo: IUserRepository,
    ) { }

    async execute(refreshToken: string): Promise<Result<RefreshResponse, AuthenticationError>> {
        const payloadResult = await this.tokenService.verifyRefreshToken(refreshToken);
        if (payloadResult.isFailure) {
            return Result.fail(new AuthenticationError('Invalid or expired refresh token'));
        }

        const hash = this.tokenService.hashToken(refreshToken);
        const userOptional = await this.userRepo.findByRefreshTokenHash(hash);
        if (!userOptional.hasValue) {
            return Result.fail(new AuthenticationError('Token not recognized'));
        }

        const user = userOptional.value;
        // Rotate refresh token: revoke all, issue new pair
        await this.userRepo.revokeAllRefreshTokens(user.id);

        const tokens = await this.tokenService.generateTokens({
            userId: user.id,
            role: user.role,
        });

        await this.userRepo.saveRefreshToken(user.id, this.tokenService.hashToken(tokens.refreshToken));

        return Result.ok({ access_token: tokens.accessToken });
    }
}