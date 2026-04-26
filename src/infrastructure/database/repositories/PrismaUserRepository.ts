import { injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { User } from '@domain/entities/User';
import { Optional } from '@shared/result/Optional';
import PrismaClientSingleton from '../prisma/PrismaClientSingleton';
import { PrismaClient } from '@prisma/client';

@injectable()
export class PrismaUserRepository implements IUserRepository {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaClientSingleton.getInstance();
    }

    async findByEmail(email: string): Promise<Optional<User>> {
        const record = await this.prisma.user.findUnique({ where: { email } });
        if (!record) return Optional.empty();
        return Optional.of(this.toDomain(record));
    }

    async findById(id: string): Promise<Optional<User>> {
        const record = await this.prisma.user.findUnique({ where: { id } });
        if (!record) return Optional.empty();
        return Optional.of(this.toDomain(record));
    }

    async create(user: User): Promise<User> {
        const created = await this.prisma.user.create({
            data: {
                id: user.id,
                name: user.name,
                email: user.email,
                password: user.hashedPassword,
                role: user.role,
                farmName: user.farmName ?? null,
                farmId: user.farmId ?? null,
            },
        });
        return this.toDomain(created);
    }

    async update(user: User): Promise<User> {
        const updated = await this.prisma.user.update({
            where: { id: user.id },
            data: {
                name: user.name,
                email: user.email,
                password: user.hashedPassword,
                role: user.role,
                farmName: user.farmName ?? null,
                farmId: user.farmId ?? null,
            },
        });
        return this.toDomain(updated);
    }

    async saveRefreshToken(userId: string, refreshTokenHash: string): Promise<void> {
        await this.prisma.refreshToken.create({
            data: {
                tokenHash: refreshTokenHash,
                userId: userId,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
        });
    }

    async revokeAllRefreshTokens(userId: string): Promise<void> {
        await this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    async findByRefreshTokenHash(hash: string): Promise<Optional<User>> {
        const tokenRecord = await this.prisma.refreshToken.findFirst({
            where: { tokenHash: hash },
            include: { user: true },
        });
        if (!tokenRecord) return Optional.empty();
        return Optional.of(this.toDomain(tokenRecord.user));
    }

    private toDomain(prismaUser: any): User {
        return User.create({
            id: prismaUser.id,
            name: prismaUser.name,
            email: prismaUser.email,
            hashedPassword: prismaUser.password,
            role: prismaUser.role,
            farmName: prismaUser.farmName ?? undefined,
            farmId: prismaUser.farmId ?? undefined,
        });
    }
}