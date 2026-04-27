import { IPasswordService } from '../../src/application/ports/IPasswordService';

export class MockPasswordService implements IPasswordService {
    async hash(plain: string): Promise<string> {
        return `hashed_${plain}`;
    }

    async compare(plain: string, hash: string): Promise<boolean> {
        return hash === `hashed_${plain}`;
    }
}