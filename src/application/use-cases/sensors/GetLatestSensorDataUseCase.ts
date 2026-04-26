import { inject, injectable } from 'tsyringe';
import { ISensorService } from '@application/ports/ISensorService';
import { Result } from '@shared/result/Result';
import { SensorDTO } from '@application/dtos/SensorDTO';
import { NotFoundError } from '@domain/errors/NotFoundError';

@injectable()
export class GetLatestSensorDataUseCase {
    constructor(@inject('ISensorService') private sensorService: ISensorService) { }

    async execute(farmId: string): Promise<Result<SensorDTO, NotFoundError>> {
        const reading = await this.sensorService.getLatestByFarmId(farmId);
        if (reading.isFailure) return Result.fail(reading.error);
        return Result.ok(reading.value.toJSON());
    }
}