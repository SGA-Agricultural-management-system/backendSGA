import { describe, it, expect } from 'vitest';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { MockUserRepository } from '../mocks/MockUserRepository';
import { MockPasswordService } from '../mocks/MockPasswordService';
import { MockTokenService } from '../mocks/MockTokenService';
import { User } from '@domain/entities/User';
import { v4 as uuid } from 'uuid';

describe('LoginUseCase', () => {
    it('should return tokens and user when credentials are valid', async () => {
        const userRepo = new MockUserRepository();
        const passwordService = new MockPasswordService();
        const tokenService = new MockTokenService();
        const useCase = new LoginUseCase(userRepo, passwordService, tokenService);

        const user = User.create({
            id: uuid(),
            name: 'Test',
            email: 'test@test.com',
            hashedPassword: await passwordService.hash('password123'),
            role: 'farmer',
        });
        await userRepo.create(user); // Usamos create porque mock no tiene addUser; lo añadimos al array

        const result = await useCase.execute({ email: 'test@test.com', password: 'password123' });

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.access_token).toContain('access_');
            expect(result.value.refresh_token).toContain('refresh_');
            expect(result.value.user.email).toBe('test@test.com');
        }
    });

    it('should fail when email does not exist', async () => {
        const userRepo = new MockUserRepository();
        const useCase = new LoginUseCase(userRepo, new MockPasswordService(), new MockTokenService());

        const result = await useCase.execute({ email: 'no@user.com', password: 'password' });

        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.message).toBe('Invalid credentials');
        }
    });

    it('should fail when password is wrong', async () => {
        const userRepo = new MockUserRepository();
        const passwordService = new MockPasswordService();
        const tokenService = new MockTokenService();
        const useCase = new LoginUseCase(userRepo, passwordService, tokenService);

        const user = User.create({
            id: uuid(),
            name: 'Test',
            email: 'test@test.com',
            hashedPassword: await passwordService.hash('correct'),
            role: 'farmer',
        });
        await userRepo.create(user);

        const result = await useCase.execute({ email: 'test@test.com', password: 'wrong' });

        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.message).toBe('Invalid credentials');
        }
    });

    it('should fail with invalid email format', async () => {
        const useCase = new LoginUseCase(new MockUserRepository(), new MockPasswordService(), new MockTokenService());
        const result = await useCase.execute({ email: 'invalid', password: 'pass' });
        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.message).toBe('Invalid email format');
        }
    });
});