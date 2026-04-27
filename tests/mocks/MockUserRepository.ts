import { IUserRepository } from '../../src/domain/repositories/IUserRepository';
import { User } from '../../src/domain/entities/User';
import { Optional } from '../../src/shared/result/Optional';

export class MockUserRepository implements IUserRepository {
    private users: User[] = [];

    async findByEmail(email: string): Promise<Optional<User>> {
        const user = this.users.find(u => u.email === email);
        return Optional.of(user ?? null);
    }

    async findById(id: string): Promise<Optional<User>> {
        const user = this.users.find(u => u.id === id);
        return Optional.of(user ?? null);
    }

    async create(user: User): Promise<User> {
        this.users.push(user);
        return user;
    }

    async update(user: User): Promise<User> {
        const idx = this.users.findIndex(u => u.id === user.id);
        if (idx >= 0) this.users[idx] = user;
        return user;
    }

    async saveRefreshToken(userId: string, refreshTokenHash: string): Promise<void> { }
    async revokeAllRefreshTokens(userId: string): Promise<void> { }
    async findByRefreshTokenHash(hash: string): Promise<Optional<User>> {
        return Optional.empty();
    }

    // Helper para tests
    addUser(user: User): void {
        this.users.push(user);
    }
}