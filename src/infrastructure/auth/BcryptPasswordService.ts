import { injectable } from 'tsyringe';
import bcrypt from 'bcrypt';
import { IPasswordService } from '@application/ports/IPasswordService';
import { env } from '@shared/config/env';

@injectable()
export class BcryptPasswordService implements IPasswordService {
    private readonly saltRounds: number;

    constructor() {
        this.saltRounds = env.BCRYPT_SALT_ROUNDS;
    }

    async hash(plain: string): Promise<string> {
        return bcrypt.hash(plain, this.saltRounds);
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return bcrypt.compare(plain, hash);
    }
}