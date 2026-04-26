import { DomainError } from "./DomainError";

export class ConflictError extends DomainError {
    readonly code = 'CONFLICT';
    readonly statusCode = 409;
}