import { Result } from '@shared/result/Result';
import { ValidationError } from '@domain/errors/ValidationError';

export interface IPasswordService {
    hash(plain: string): Promise<string>;
    compare(plain: string, hash: string): Promise<boolean>;
}