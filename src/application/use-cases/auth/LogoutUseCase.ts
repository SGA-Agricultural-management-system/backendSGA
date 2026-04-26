import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { ICacheService } from '@application/ports/ICacheService';
import { Result } from '@shared/result/Result';

@injectable()
export class LogoutUseCase {
    constructor(
        @inject('IUserRepository') private userRepo: IUserRepository,
        @inject('ICacheService') private cache: ICacheService,
    ) { }

    async execute(userId: string): Promise<Result<void>> {
        await this.userRepo.revokeAllRefreshTokens(userId);
        // Blacklist current access token via cache (implemented in middleware)
        // For now, just revoke refresh tokens
        return Result.ok(undefined);
    }
}