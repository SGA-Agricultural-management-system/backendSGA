import { FastifyRequest, FastifyReply } from 'fastify';
import { inject, injectable } from 'tsyringe';
import { GetLatestSensorDataUseCase } from '@application/use-cases/sensors/GetLatestSensorDataUseCase';

@injectable()
export class SensorController {
    constructor(
        @inject(GetLatestSensorDataUseCase) private getLatestSensorDataUseCase: GetLatestSensorDataUseCase,
    ) { }

    async latest(request: FastifyRequest, reply: FastifyReply) {
        const { id } = request.params as { id: string };
        const result = await this.getLatestSensorDataUseCase.execute(id);
        if (result.isFailure) {
            return reply.status(404).send({ error: result.error.message, code: result.error.code });
        }
        return reply.send(result.value);
    }
}