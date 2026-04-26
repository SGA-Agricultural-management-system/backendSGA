import { Result } from '@shared/result/Result';
import { ValidationError } from '../errors/ValidationError';

export class Email {
    private constructor(public readonly value: string) { }

    static create(email: string): Result<Email, ValidationError> {
        const trimmed = email.trim().toLowerCase();
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!re.test(trimmed)) {
            return Result.fail(new ValidationError('Invalid email format'));
        }
        return Result.ok(new Email(trimmed));
    }
}