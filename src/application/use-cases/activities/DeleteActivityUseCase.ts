import { inject, injectable } from 'tsyringe';
import { IActivityRepository } from '@domain/repositories/IActivityRepository';
import { Result } from '@shared/result/Result';
import { ActivityNotFoundError } from '@domain/errors/ActivityNotFoundError';

@injectable()
export class DeleteActivityUseCase {
    constructor(@inject('IActivityRepository') private activityRepo: IActivityRepository) { }

    async execute(id: string): Promise<Result<void>> {
        const existing = await this.activityRepo.findById(id);
        if (!existing) return Result.fail(new ActivityNotFoundError(id));
        await this.activityRepo.delete(id);
        return Result.ok(undefined);
    }
}