import { Farm } from '../entities/Farm';
import { User } from '../entities/User';

export class FarmDomainService {
    /**
     * Verifica si un usuario tiene acceso a la finca (owner o admin).
     */
    static userCanAccessFarm(user: User, farm: Farm): boolean {
        return user.role === 'admin' || user.farmId === farm.id;
    }
}