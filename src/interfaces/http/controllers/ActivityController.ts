import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { GetActivitiesUseCase } from '@application/use-cases/activities/GetActivitiesUseCase';
import { CreateActivityUseCase } from '@application/use-cases/activities/CreateActivityUseCase';
import { UpdateActivityUseCase } from '@application/use-cases/activities/UpdateActivityUseCase';
import { DeleteActivityUseCase } from '@application/use-cases/activities/DeleteActivityUseCase';
import { ActivityQuery } from '@application/dtos/ActivityQuery';
import { CreateActivityRequest, UpdateActivityRequest } from '@application/dtos/ActivityDTO';
import { DomainError } from '@domain/errors/DomainError';

@injectable()
export class ActivityController {
    constructor(
        @inject(GetActivitiesUseCase) private getActivitiesUseCase: GetActivitiesUseCase,
        @inject(CreateActivityUseCase) private createActivityUseCase: CreateActivityUseCase,
        @inject(UpdateActivityUseCase) private updateActivityUseCase: UpdateActivityUseCase,
        @inject(DeleteActivityUseCase) private deleteActivityUseCase: DeleteActivityUseCase,
    ) { }

    async getActivities(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const query = request.query as Record<string, string>;
        const activityQuery: ActivityQuery = {
            farmId: id,
            page: parseInt(query.page || '1'),
            limit: parseInt(query.limit || '10'),
        };
        if (query.type) activityQuery.type = query.type;

        const result = await this.getActivitiesUseCase.execute(activityQuery);
        return reply.send(result.value);
    }

    async createActivity(request: FastifyRequest, reply: FastifyReply) {
        const userId = request.userId!;
        const payload = request.body as CreateActivityRequest;
        const result = await this.createActivityUseCase.execute(payload, userId);
        if (result.isFailure) {
            return this.handleError(result.error, reply);
        }
        return reply.status(201).send(result.value);
    }

    async updateActivity(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const changes = request.body as UpdateActivityRequest;
        const result = await this.updateActivityUseCase.execute(id, changes);
        if (result.isFailure) {
            return this.handleError(result.error, reply);
        }
        return reply.send(result.value);
    }

    async deleteActivity(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const result = await this.deleteActivityUseCase.execute(id);
        if (result.isFailure) {
            return this.handleError(result.error, reply, 404);
        }
        return reply.send({ message: 'Activity deleted' });
    }

    // Helper reutilizable dentro del controlador
    private handleError(error: Error, reply: FastifyReply, defaultStatus = 400) {
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