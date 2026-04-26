import { inject, injectable } from 'tsyringe';
import { IFarmRepository } from '@domain/repositories/IFarmRepository';
import { Result } from '@shared/result/Result';
import { FarmDTO } from '@application/dtos/FarmDTO';

@injectable()
export class GetFarmsUseCase {
    constructor(@inject('IFarmRepository') private farmRepo: IFarmRepository) { }

    async execute(userId: string): Promise<Result<{ data: FarmDTO[] }>> {
        const farms = await this.farmRepo.findAllByUserId(userId);
        return Result.ok({
            data: farms.map(f => ({ id: f.id, name: f.name, location: f.location })),
        });
    }
}