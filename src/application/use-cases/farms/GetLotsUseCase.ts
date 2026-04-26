import { inject, injectable } from 'tsyringe';
import { IFarmRepository } from '@domain/repositories/IFarmRepository';
import { Result } from '@shared/result/Result';
import { FarmNotFoundError } from '@domain/errors/FarmNotFoundError';
import { LotDTO } from '@application/dtos/LotDTO';

@injectable()
export class GetLotsUseCase {
    constructor(@inject('IFarmRepository') private farmRepo: IFarmRepository) { }

    async execute(farmId: string): Promise<Result<{ data: LotDTO[] }>> {
        const farm = await this.farmRepo.findById(farmId);
        if (!farm) return Result.fail(new FarmNotFoundError(farmId));
        const lots = await this.farmRepo.findLotsByFarmId(farmId);
        return Result.ok({
            data: lots.map(lot => lot.toJSON()),
        });
    }
}