import { injectable } from 'tsyringe';
import { IFarmRepository } from '@domain/repositories/IFarmRepository';
import { Farm } from '@domain/entities/Farm';
import { Lot } from '@domain/entities/Lot';
import PrismaClientSingleton from '../prisma/PrismaClientSingleton';
import { PrismaClient } from '@prisma/client';

@injectable()
export class PrismaFarmRepository implements IFarmRepository {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaClientSingleton.getInstance();
    }

    async findAllByUserId(userId: string): Promise<Farm[]> {
        const farms = await this.prisma.farm.findMany({
            where: { userId },
            include: { lots: true },
        });
        return farms.map(f => this.toDomain(f));
    }

    async findById(id: string): Promise<Farm | null> {
        const farm = await this.prisma.farm.findUnique({
            where: { id },
            include: { lots: true },
        });
        return farm ? this.toDomain(farm) : null;
    }

    async findLotsByFarmId(farmId: string): Promise<Lot[]> {
        const lots = await this.prisma.lot.findMany({
            where: { farmId },
        });
        return lots.map(lot =>
            Lot.create({ id: lot.id, name: lot.name, crop: lot.crop }),
        );
    }

    private toDomain(farmRecord: any): Farm {
        const lots = (farmRecord.lots || []).map((lot: any) =>
            Lot.create({ id: lot.id, name: lot.name, crop: lot.crop }),
        );
        return Farm.create(
            { id: farmRecord.id, name: farmRecord.name, location: farmRecord.location },
            lots,
        );
    }
}