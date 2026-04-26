import { injectable } from 'tsyringe';
import { IActivityRepository } from '@domain/repositories/IActivityRepository';
import { Activity } from '@domain/entities/Activity';
import { ActivityType } from '@domain/value-objects/ActivityType';
import { Quantity } from '@domain/value-objects/Quantity';
import { PaginatedResult } from '@shared/result/PaginatedResult';
import { ActivityQuery } from '@application/dtos/ActivityQuery';
import PrismaClientSingleton from '../prisma/PrismaClientSingleton';
import { PrismaClient, Prisma } from '@prisma/client';

@injectable()
export class PrismaActivityRepository implements IActivityRepository {
    private readonly prisma: PrismaClient;

    constructor() {
        this.prisma = PrismaClientSingleton.getInstance();
    }

    async findByFarmId(query: ActivityQuery): Promise<PaginatedResult<Activity>> {
        const { farmId, type, page, limit } = query;
        const where: Prisma.ActivityWhereInput = { farmId };
        if (type) {
            where.type = type;
        }

        const [data, total] = await this.prisma.$transaction([
            this.prisma.activity.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { date: 'desc' },
            }),
            this.prisma.activity.count({ where }),
        ]);

        return {
            data: data.map(record => this.toDomain(record)),
            total,
            page,
            limit,
        };
    }

    async create(activity: Activity): Promise<Activity> {
        const created = await this.prisma.activity.create({
            data: this.toPrisma(activity),
        });
        return this.toDomain(created);
    }

    async update(activity: Activity): Promise<Activity> {
        const updated = await this.prisma.activity.update({
            where: { id: activity.id },
            data: this.toPrisma(activity),
        });
        return this.toDomain(updated);
    }

    async delete(id: string): Promise<void> {
        await this.prisma.activity.delete({ where: { id } });
    }

    async findById(id: string): Promise<Activity | null> {
        const record = await this.prisma.activity.findUnique({ where: { id } });
        return record ? this.toDomain(record) : null;
    }

    private toDomain(record: any): Activity {
        const typeResult = ActivityType.fromString(record.type);
        const quantity = Quantity.create(record.quantity, record.unit);
        // Asumimos que los datos de BD son válidos
        return Activity.create({
            id: record.id,
            type: typeResult.value, // en BD siempre guardamos string válido
            lotId: record.lotId,
            crop: record.crop,
            quantity: quantity.value,
            date: record.date,
            notes: record.notes ?? undefined,
            farmId: record.farmId,
        });
    }

    private toPrisma(activity: Activity): any {
        return {
            id: activity.id,
            type: activity.type.value,
            lotId: activity.lotId,
            crop: activity.crop,
            quantity: activity.quantity.amount,
            unit: activity.quantity.unit,
            date: activity.date,
            notes: activity.notes ?? null,
            farmId: activity.farmId,
        };
    }
}