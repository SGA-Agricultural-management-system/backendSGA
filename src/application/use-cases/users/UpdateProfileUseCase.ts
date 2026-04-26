import { inject, injectable } from 'tsyringe';
import { IUserRepository } from '@domain/repositories/IUserRepository';
import { Result } from '@shared/result/Result';
import { UserNotFoundError } from '@domain/errors/UserNotFoundError';
import { UserDTO } from '@application/dtos/UserDTO';
import { User } from '@domain/entities/User';

@injectable()
export class UpdateProfileUseCase {
    constructor(@inject('IUserRepository') private userRepo: IUserRepository) { }

    async execute(userId: string, changes: { name?: string; farmName?: string }): Promise<Result<UserDTO, UserNotFoundError>> {
        const userOptional = await this.userRepo.findById(userId);
        if (!userOptional.hasValue) return Result.fail(new UserNotFoundError(userId));

        const current = userOptional.value;
        const updated = User.create({
            id: current.id,
            name: changes.name ?? current.name,
            email: current.email,
            hashedPassword: current.hashedPassword,
            role: current.role,
            farmName: changes.farmName ?? current.farmName,
            farmId: current.farmId,
        });

        const saved = await this.userRepo.update(updated);
        return Result.ok(saved.toJSON());
    }
}