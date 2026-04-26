import { DomainError } from "./DomainError";

export class AuthenticationError extends DomainError {
    readonly code = 'AUTHENTICATION_ERROR';
    readonly statusCode = 401;
}