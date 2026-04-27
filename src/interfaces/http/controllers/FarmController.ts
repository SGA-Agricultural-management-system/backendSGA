import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { GetFarmsUseCase } from '@application/use-cases/farms/GetFarmsUseCase';
import { GetFarmByIdUseCase } from '@application/use-cases/farms/GetFarmByIdUseCase';
import { GetLotsUseCase } from '@application/use-cases/farms/GetLotsUseCase';
import { DomainError } from '@domain/errors/DomainError';

@injectable()
export class FarmController {
    constructor(
        @inject(GetFarmsUseCase) private getFarmsUseCase: GetFarmsUseCase,
        @inject(GetFarmByIdUseCase) private getFarmByIdUseCase: GetFarmByIdUseCase,
        @inject(GetLotsUseCase) private getLotsUseCase: GetLotsUseCase,
    ) { }

    async getFarms(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.userId!;
        const result = await this.getFarmsUseCase.execute(userId);
        return reply.send(result.value);
    }

    async getFarmById(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const result = await this.getFarmByIdUseCase.execute(id);
        if (result.isFailure) {
            return this.handleError(result.error, reply);
        }
        return reply.send(result.value);
    }

    async getLots(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const result = await this.getLotsUseCase.execute(id);
        if (result.isFailure) {
            return this.handleError(result.error, reply);
        }
        return reply.send(result.value);
    }

    private handleError(error: Error, reply: FastifyReply) {
        if (error instanceof DomainError) {
            return reply.status(error.statusCode).send({
                error: error.message,
                code: error.code,
            });
        }
        return reply.status(500).send({
            error: 'Internal server error',
            code: 'INTERNAL_ERROR',
        });
    }
}