import { NotFoundError } from "./NotFoundError";

export class FarmNotFoundError extends NotFoundError {
    constructor(id: string) {
        super(`Farm with id ${id} not found`);
    }
}