import { describe, it, expect } from 'vitest';
import { CreateActivityUseCase } from '@application/use-cases/activities/CreateActivityUseCase';
import { MockActivityRepository } from '../mocks/MockActivityRepository';
import { MockFarmRepository } from '../mocks/MockFarmRepository';
import { Farm } from '@domain/entities/Farm';
import { v4 as uuid } from 'uuid';

describe('CreateActivityUseCase', () => {
    it('should create a valid activity', async () => {
        const farmRepo = new MockFarmRepository();
        const activityRepo = new MockActivityRepository();
        const useCase = new CreateActivityUseCase(activityRepo, farmRepo);

        const farmId = uuid();
        farmRepo.addFarm(Farm.create({ id: farmId, name: 'Finca 1', location: 'Santander' }));

        const result = await useCase.execute({
            type: 'Riego',
            lot_id: uuid(),
            crop: 'Café',
            quantity: 10,
            unit: 'litros',
            date: new Date().toISOString(),
            farm_id: farmId,
        }, 'user1');

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.type).toBe('Riego');
            expect(result.value.quantity).toBe(10);
        }
    });

    it('should fail when farm does not exist', async () => {
        const farmRepo = new MockFarmRepository();
        const useCase = new CreateActivityUseCase(new MockActivityRepository(), farmRepo);

        const result = await useCase.execute({
            type: 'Riego',
            lot_id: uuid(),
            crop: 'Café',
            quantity: 10,
            unit: 'litros',
            date: new Date().toISOString(),
            farm_id: uuid(), // no existe
        }, 'user1');

        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.message).toContain('not found');
        }
    });

    it('should fail with invalid activity type', async () => {
        const farmRepo = new MockFarmRepository();
        const farmId = uuid();
        farmRepo.addFarm(Farm.create({ id: farmId, name: 'Finca', location: 'Santander' }));

        const useCase = new CreateActivityUseCase(new MockActivityRepository(), farmRepo);

        const result = await useCase.execute({
            type: 'TipoInválido',
            lot_id: uuid(),
            crop: 'Café',
            quantity: 10,
            unit: 'litros',
            date: new Date().toISOString(),
            farm_id: farmId,
        }, 'user1');

        expect(result.isFailure).toBe(true);
        if (result.isFailure) {
            expect(result.error.message).toContain('Invalid activity type');
        }
    });
});