import { Result } from '@shared/result/Result';
import { ValidationError } from '../errors/ValidationError';

export class Password {
    private constructor(public readonly value: string) { }

    static create(raw: string): Result<Password, ValidationError> {
        if (raw.length < 8) {
            return Result.fail(new ValidationError('Password must be at least 8 characters'));
        }
        return Result.ok(new Password(raw));
    }
}