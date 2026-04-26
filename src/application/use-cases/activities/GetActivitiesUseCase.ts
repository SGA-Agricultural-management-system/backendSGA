import { inject, injectable } from 'tsyringe';
import { IActivityRepository } from '@domain/repositories/IActivityRepository';
import { Result } from '@shared/result/Result';
import { ActivityQuery } from '@application/dtos/ActivityQuery';
import { ActivityDTO } from '@application/dtos/ActivityDTO';
import { PaginationDTO } from '@application/dtos/PaginationDTO';
import { FarmNotFoundError } from '@domain/errors/FarmNotFoundError';

@injectable()
export class GetActivitiesUseCase {
  constructor(@inject('IActivityRepository') private activityRepo: IActivityRepository) {}

  async execute(query: ActivityQuery): Promise<Result<{ data: ActivityDTO[], pagination: PaginationDTO }>> {
    const paginated = await this.activityRepo.findByFarmId(query);
    const activitiesDTO = paginated.data.map(a => a.toJSON());
    return Result.ok({
      data: activitiesDTO,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: paginated.total,
        totalPages: Math.ceil(paginated.total / query.limit) || 1,
      },
    });
  }
}