import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { UpdateProfileUseCase } from '@application/use-cases/users/UpdateProfileUseCase';
import { ChangePasswordUseCase } from '@application/use-cases/users/ChangePasswordUseCase';
import { UpdateProfileRequest, ChangePasswordRequest } from '@application/dtos/UserUpdateDTO';

@injectable()
export class UserController {
    constructor(
        @inject(UpdateProfileUseCase) private updateProfileUseCase: UpdateProfileUseCase,
        @inject(ChangePasswordUseCase) private changePasswordUseCase: ChangePasswordUseCase,
    ) { }

    async updateProfile(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.userId!;
        const body = request.body as UpdateProfileRequest;
        const result = await this.updateProfileUseCase.execute(userId, {
            name: body.name,
            farmName: body.farm_name,
        });
        if (result.isFailure) {
            return reply.status(404).send({ error: result.error.message, code: result.error.code });
        }
        return reply.send(result.value);
    }

    async changePassword(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.userId!;
        const body = request.body as ChangePasswordRequest;
        const result = await this.changePasswordUseCase.execute(userId, body.current_password, body.new_password);
        if (result.isFailure) {
            return reply.status(result.error.statusCode).send({ error: result.error.message, code: result.error.code });
        }
        return reply.send({ message: 'Password updated' });
    }
}