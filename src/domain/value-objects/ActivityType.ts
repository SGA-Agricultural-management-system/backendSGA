import { Result } from '@shared/result/Result';
import { ValidationError } from '../errors/ValidationError';

export enum ActivityTypeEnum {
    IRRIGATION = 'Riego',
    FERTILIZATION = 'Fertilización',
    FUMIGATION = 'Fumigación',
    PEST_CONTROL = 'Control de Plagas',
    TEMPERATURE = 'Temperatura',
    HARVEST = 'Cosecha',
    OTHER = 'Otro',
}

export class ActivityType {
    private constructor(public readonly value: ActivityTypeEnum) { }

    static fromString(type: string): Result<ActivityType, ValidationError> {
        const entry = Object.entries(ActivityTypeEnum).find(
            ([, val]) => val === type,
        );
        if (!entry) {
            const allowed = Object.values(ActivityTypeEnum).join(', ');
            return Result.fail(new ValidationError(`Invalid activity type. Allowed: ${allowed}`));
        }
        return Result.ok(new ActivityType(entry[1] as ActivityTypeEnum));
    }

    equals(other: ActivityType): boolean {
        return this.value === other.value;
    }
}