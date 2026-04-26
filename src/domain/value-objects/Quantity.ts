import { Result } from '@shared/result/Result';
import { ValidationError } from '../errors/ValidationError';

export class Quantity {
    private constructor(
        public readonly amount: number,
        public readonly unit: string,
    ) { }

    static create(amount: number, unit: string): Result<Quantity, ValidationError> {
        if (amount <= 0) {
            return Result.fail(new ValidationError('Quantity must be positive'));
        }
        const trimmedUnit = unit.trim();
        if (!trimmedUnit) {
            return Result.fail(new ValidationError('Unit is required'));
        }
        return Result.ok(new Quantity(amount, trimmedUnit));
    }
}