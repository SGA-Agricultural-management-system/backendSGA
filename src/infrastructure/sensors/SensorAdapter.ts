import { injectable } from 'tsyringe';
import { ISensorService } from '@application/ports/ISensorService';
import { SensorReading } from '@domain/entities/SensorReading';
import { Result } from '@shared/result/Result';
import { NotFoundError } from '@domain/errors/NotFoundError';
import PrismaClientSingleton from '../database/prisma/PrismaClientSingleton';
import { PrismaClient } from '@prisma/client';

@injectable()
export class SensorAdapter implements ISensorService {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaClientSingleton.getInstance();
    }

    async getLatestByFarmId(farmId: string): Promise<Result<SensorReading, NotFoundError>> {
        const reading = await this.prisma.sensorReading.findFirst({
            where: { farmId },
            orderBy: { recordedAt: 'desc' },
        });

        if (!reading) {
            return Result.fail(new NotFoundError(`No sensor data for farm ${farmId}`));
        }

        return Result.ok(
            SensorReading.create({
                temperature: reading.temperature,
                humidity: reading.humidity,
                updatedAt: reading.recordedAt,
            }),
        );
    }
}