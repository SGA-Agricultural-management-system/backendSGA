import { DomainError } from "./DomainError";

export class AuthorizationError extends DomainError {
    readonly code = 'AUTHORIZATION_ERROR';
    readonly statusCode = 403;
}