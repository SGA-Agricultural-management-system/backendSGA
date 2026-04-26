import { Result } from '@shared/result/Result';
import { AuthenticationError } from '@domain/errors/AuthenticationError';

export interface TokenPayload {
    userId: string;
    role: string;
    // iat, exp handled by lib
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

export interface ITokenService {
    generateTokens(payload: TokenPayload): Promise<TokenPair>;
    verifyAccessToken(token: string): Promise<Result<TokenPayload, AuthenticationError>>;
    verifyRefreshToken(token: string): Promise<Result<TokenPayload, AuthenticationError>>;
    hashToken(token: string): string;
}