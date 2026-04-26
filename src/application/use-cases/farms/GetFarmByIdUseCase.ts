import { inject, injectable } from 'tsyringe';
import { IFarmRepository } from '@domain/repositories/IFarmRepository';
import { Result } from '@shared/result/Result';
import { NotFoundError} from '@domain/errors/NotFoundError';
import { FarmWithLotsDTO } from '@application/dtos/FarmDTO';
import { FarmNotFoundError } from '@domain/errors/FarmNotFoundError';

@injectable()
export class GetFarmByIdUseCase {
    constructor(@inject('IFarmRepository') private farmRepo: IFarmRepository) { }

    async execute(id: string): Promise<Result<FarmWithLotsDTO, NotFoundError>> {
        const farm = await this.farmRepo.findById(id);
        if (!farm) return Result.fail(new FarmNotFoundError(id));
        return Result.ok(farm.toJSON() as FarmWithLotsDTO);
    }
}