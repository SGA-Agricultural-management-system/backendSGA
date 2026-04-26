import { inject, injectable } from 'tsyringe';
import { IActivityRepository } from '@domain/repositories/IActivityRepository';
import { Result } from '@shared/result/Result';
import { UpdateActivityRequest, ActivityDTO } from '@application/dtos/ActivityDTO';
import { ActivityNotFoundError } from '@domain/errors/ActivityNotFoundError';
import { Activity } from '@domain/entities/Activity';
import { ActivityType } from '@domain/value-objects/ActivityType';
import { Quantity } from '@domain/value-objects/Quantity';

@injectable()
export class UpdateActivityUseCase {
    constructor(@inject('IActivityRepository') private activityRepo: IActivityRepository) { }

    async execute(id: string, changes: UpdateActivityRequest): Promise<Result<ActivityDTO>> {
        const existing = await this.activityRepo.findById(id);
        if (!existing) return Result.fail(new ActivityNotFoundError(id));

        // Apply partial updates
        let type = existing.type;
        if (changes.type) {
            const typeResult = ActivityType.fromString(changes.type);
            if (typeResult.isFailure) return Result.fail(typeResult.error);
            type = typeResult.value;
        }

        let quantity = existing.quantity;
        if (changes.quantity !== undefined && changes.unit) {
            const qtyResult = Quantity.create(changes.quantity, changes.unit);
            if (qtyResult.isFailure) return Result.fail(qtyResult.error);
            quantity = qtyResult.value;
        }

        const updated = Activity.create({
            id: existing.id,
            type,
            lotId: changes.lot_id ?? existing.lotId,
            crop: changes.crop?.trim() ?? existing.crop,
            quantity,
            date: changes.date ? new Date(changes.date) : existing.date,
            notes: changes.notes?.trim() ?? existing.notes,
            farmId: existing.farmId,
        });

        const saved = await this.activityRepo.update(updated);
        return Result.ok(saved.toJSON());
    }
}