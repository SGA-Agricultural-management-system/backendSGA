import { NotFoundError } from "./NotFoundError";

export class UserNotFoundError extends NotFoundError {
  constructor(identifier: string) {
    super(`User with email/id ${identifier} not found`);
  }
}