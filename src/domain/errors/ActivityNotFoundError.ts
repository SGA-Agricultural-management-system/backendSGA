import { NotFoundError } from "./NotFoundError";

export class ActivityNotFoundError extends NotFoundError {
    constructor(id: string) {
        super(`Activity with id ${id} not found`);
    }
}