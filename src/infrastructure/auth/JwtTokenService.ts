import { injectable } from 'tsyringe';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ITokenService, TokenPayload, TokenPair } from '@application/ports/ITokenService';
import { env } from '@shared/config/env';
import { Result } from '@shared/result/Result';
import { AuthenticationError } from '@domain/errors/AuthenticationError';

@injectable()
export class JwtTokenService implements ITokenService {
    private readonly privateKey: string;
    private readonly publicKey: string;

    constructor() {
        this.privateKey = env.JWT_PRIVATE_KEY.replace(/\\n/g, '\n');
        this.publicKey = env.JWT_PUBLIC_KEY.replace(/\\n/g, '\n');
    }

    async generateTokens(payload: TokenPayload): Promise<TokenPair> {
        const accessToken = jwt.sign(payload, this.privateKey, {
            algorithm: 'RS256',
            expiresIn: `${env.ACCESS_TOKEN_EXPIRY_MINUTES}m`,
        });

        const refreshToken = jwt.sign(
            { userId: payload.userId, type: 'refresh' },
            this.privateKey,
            {
                algorithm: 'RS256',
                expiresIn: `${env.REFRESH_TOKEN_EXPIRY_DAYS}d`,
            },
        );

        return { accessToken, refreshToken };
    }

    async verifyAccessToken(token: string): Promise<Result<TokenPayload, AuthenticationError>> {
        try {
            const decoded = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as TokenPayload;
            return Result.ok(decoded);
        } catch (err) {
            return Result.fail(new AuthenticationError('Invalid or expired access token'));
        }
    }

    async verifyRefreshToken(token: string): Promise<Result<TokenPayload, AuthenticationError>> {
        try {
            const decoded = jwt.verify(token, this.publicKey, { algorithms: ['RS256'] }) as TokenPayload;
            return Result.ok(decoded);
        } catch (err) {
            return Result.fail(new AuthenticationError('Invalid or expired refresh token'));
        }
    }

    hashToken(token: string): string {
        return crypto.createHash('sha256').update(token).digest('hex');
    }
}