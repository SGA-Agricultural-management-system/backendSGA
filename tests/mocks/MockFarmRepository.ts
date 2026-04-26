import { IFarmRepository } from '@domain/repositories/IFarmRepository';
import { Farm } from '@domain/entities/Farm';
import { Lot } from '@domain/entities/Lot';

export class MockFarmRepository implements IFarmRepository {
    private farms: Farm[] = [];
    private lots: Lot[] = [];

    async findAllByUserId(userId: string): Promise<Farm[]> {
        return this.farms.filter(f => f.id === userId); // Simplificado
    }

    async findById(id: string): Promise<Farm | null> {
        return this.farms.find(f => f.id === id) ?? null;
    }

    async findLotsByFarmId(farmId: string): Promise<Lot[]> {
        return this.lots.filter(l => l.id === farmId); // Simplificado
    }

    addFarm(farm: Farm): void {
        this.farms.push(farm);
    }
}