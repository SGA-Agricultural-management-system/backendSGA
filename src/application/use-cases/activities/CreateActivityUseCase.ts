import { inject, injectable } from 'tsyringe';
import { IActivityRepository } from '@domain/repositories/IActivityRepository';
import { IFarmRepository } from '@domain/repositories/IFarmRepository';
import { Result } from '@shared/result/Result';
import { CreateActivityRequest, ActivityDTO } from '@application/dtos/ActivityDTO';
import { ValidationError } from '@domain/errors/ValidationError';
import { NotFoundError } from '@domain/errors/NotFoundError';
import { Activity } from '@domain/entities/Activity';
import { ActivityType } from '@domain/value-objects/ActivityType';
import { Quantity } from '@domain/value-objects/Quantity';
import { v4 as uuid } from 'uuid';

@injectable()
export class CreateActivityUseCase {
    constructor(
        @inject('IActivityRepository') private activityRepo: IActivityRepository,
        @inject('IFarmRepository') private farmRepo: IFarmRepository,
    ) { }

    async execute(request: CreateActivityRequest, userId: string): Promise<Result<ActivityDTO, ValidationError | NotFoundError>> {
        const farm = await this.farmRepo.findById(request.farm_id);
        if (!farm) return Result.fail(new NotFoundError(`Farm with id ${request.farm_id} not found`));

        // Validate lot exists in farm (optional strictness)
        const typeResult = ActivityType.fromString(request.type);
        if (typeResult.isFailure) return Result.fail(typeResult.error);

        const quantityResult = Quantity.create(request.quantity, request.unit);
        if (quantityResult.isFailure) return Result.fail(quantityResult.error);

        const activity = Activity.create({
            id: uuid(),
            type: typeResult.value,
            lotId: request.lot_id,
            crop: request.crop.trim(),
            quantity: quantityResult.value,
            date: new Date(request.date),
            notes: request.notes?.trim(),
            farmId: request.farm_id,
        });

        const saved = await this.activityRepo.create(activity);
        return Result.ok(saved.toJSON());
    }
}