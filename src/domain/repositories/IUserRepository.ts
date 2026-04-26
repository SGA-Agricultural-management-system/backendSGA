import { User } from '../entities/User';
import { Optional } from '@shared/result/Optional';

export interface IUserRepository {
    findByEmail(email: string): Promise<Optional<User>>;
    findById(id: string): Promise<Optional<User>>;
    create(user: User): Promise<User>;
    update(user: User): Promise<User>;
    saveRefreshToken(userId: string, refreshTokenHash: string): Promise<void>;
    revokeAllRefreshTokens(userId: string): Promise<void>;
    findByRefreshTokenHash(hash: string): Promise<Optional<User>>;
}