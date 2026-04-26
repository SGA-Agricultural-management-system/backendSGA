import { ITokenService, TokenPayload, TokenPair } from '@application/ports/ITokenService';
import { Result } from '@shared/result/Result';
import { AuthenticationError } from '@domain/errors/AuthenticationError';

export class MockTokenService implements ITokenService {
    async generateTokens(payload: TokenPayload): Promise<TokenPair> {
        const accessToken = `access_${payload.userId}_${Date.now()}`;
        const refreshToken = `refresh_${payload.userId}_${Date.now()}`;
        return { accessToken, refreshToken };
    }

    async verifyAccessToken(token: string): Promise<Result<TokenPayload, AuthenticationError>> {
        if (token.startsWith('access_')) {
            const parts = token.split('_');
            return Result.ok({ userId: parts[1], role: parts[2] ?? 'farmer' });
        }
        return Result.fail(new AuthenticationError('Invalid token'));
    }

    async verifyRefreshToken(token: string): Promise<Result<TokenPayload, AuthenticationError>> {
        return this.verifyAccessToken(token); // Simplificado
    }

    hashToken(token: string): string {
        return `hash_${token}`;
    }
}