import { DomainError } from "./DomainError";

export class NotFoundError extends DomainError {
    readonly code = 'NOT_FOUND';
    readonly statusCode = 404;
}
