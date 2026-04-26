import { Farm } from '../entities/Farm';
import { Lot } from '../entities/Lot';

export interface IFarmRepository {
    findAllByUserId(userId: string): Promise<Farm[]>;
    findById(id: string): Promise<Farm | null>;
    findLotsByFarmId(farmId: string): Promise<Lot[]>;
}