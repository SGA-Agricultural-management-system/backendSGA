import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@shared/result/Result';
import { UserNotFoundError } from '@domain/errors/UserNotFoundError';
import { UserDTO } from '@application/dtos/UserDTO';

@injectable()
export class GetMeUseCase {
    constructor(@inject('IUserRepository') private userRepo: IUserRepository) { }

    async execute(userId: string): Promise<Result<UserDTO, UserNotFoundError>> {
        const userOptional = await this.userRepo.findById(userId);
        if (!userOptional.hasValue) {
            return Result.fail(new UserNotFoundError(userId));
        }
        return Result.ok(userOptional.value.toJSON());
    }
}