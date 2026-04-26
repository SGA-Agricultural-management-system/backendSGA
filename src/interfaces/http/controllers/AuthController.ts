import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { LoginUseCase } from '@application/use-cases/auth/LoginUseCase';
import { RegisterUseCase } from '@application/use-cases/auth/RegisterUseCase';
import { RefreshTokenUseCase } from '@application/use-cases/auth/RefreshTokenUseCase';
import { LogoutUseCase } from '@application/use-cases/auth/LogoutUseCase';
import { GetMeUseCase } from '@application/use-cases/auth/GetMeUseCase';
import { ForgotPasswordUseCase } from '@application/use-cases/auth/ForgotPasswordUseCase';
import { ResetPasswordUseCase } from '@application/use-cases/auth/ResetPasswordUseCase';
import { LoginRequest, RegisterRequest, RefreshRequest } from '@application/dtos/AuthDTO';
import { ValidationError } from '@domain/errors/ValidationError';

@injectable()
export class AuthController {
    constructor(
        @inject(LoginUseCase) private loginUseCase: LoginUseCase,
        @inject(RegisterUseCase) private registerUseCase: RegisterUseCase,
        @inject(RefreshTokenUseCase) private refreshTokenUseCase: RefreshTokenUseCase,
        @inject(LogoutUseCase) private logoutUseCase: LogoutUseCase,
        @inject(GetMeUseCase) private getMeUseCase: GetMeUseCase,
        @inject(ForgotPasswordUseCase) private forgotPasswordUseCase: ForgotPasswordUseCase,
        @inject(ResetPasswordUseCase) private resetPasswordUseCase: ResetPasswordUseCase,
    ) { }

    async login(request: FastifyRequest, reply: FastifyReply) {
        const result = await this.loginUseCase.execute(request.body as LoginRequest);
        if (result.isFailure) {
            return reply.status(result.error.statusCode).send({ error: result.error.message, code: result.error.code });
        }
        return reply.send(result.value);
    }

    async register(request: FastifyRequest, reply: FastifyReply) {
        const result = await this.registerUseCase.execute(request.body as RegisterRequest);
        if (result.isFailure) {
            return reply.status(result.error.statusCode).send({ error: result.error.message, code: result.error.code });
        }
        return reply.status(201).send(result.value);
    }

    async refresh(request: FastifyRequest, reply: FastifyReply) {
        const { refresh_token } = request.body as RefreshRequest;
        const result = await this.refreshTokenUseCase.execute(refresh_token);
        if (result.isFailure) {
            return reply.status(401).send({ error: result.error.message, code: result.error.code });
        }
        return reply.send(result.value);
    }

    async logout(request: FastifyRequest, reply: FastifyReply) {
        // Asume authMiddleware ya puso userId
        const userId = request.userId!;
        const result = await this.logoutUseCase.execute(userId);
        return reply.send({ message: 'Logged out' });
    }

    async me(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.userId!;
        const result = await this.getMeUseCase.execute(userId);
        if (result.isFailure) {
            return reply.status(404).send({ error: 'User not found', code: 'NOT_FOUND' });
        }
        return reply.send(result.value);
    }

    async forgotPassword(request: FastifyRequest, reply: FastifyReply) {
        const { email } = request.body as { email: string };
        const result = await this.forgotPasswordUseCase.execute(email);
        // Siempre devolver 200 para no filtrar usuarios
        return reply.send({ message: 'If email exists, reset link sent' });
    }

    async resetPassword(request: FastifyRequest, reply: FastifyReply) {
        const { token, new_password } = request.body as { token: string; new_password: string };
        const result = await this.resetPasswordUseCase.execute(token, new_password);
        if (result.isFailure) {
            return reply.status(400).send({ error: result.error.message, code: result.error.code });
        }
        return reply.send({ message: 'Password reset successfully' });
    }
}