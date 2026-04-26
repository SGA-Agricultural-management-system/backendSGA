import { SensorReading } from '@domain/entities/SensorReading';
import { Result } from '@shared/result/Result';
import { NotFoundError } from '@domain/errors/NotFoundError';

export interface ISensorService {
    getLatestByFarmId(farmId: string): Promise<Result<SensorReading, NotFoundError>>;
}