import { Activity } from '../entities/Activity';
import { Lot } from '../entities/Lot';

export class ActivityDomainService {
    /**
     * Determina si una actividad es válida para un lote y cultivo dados.
     * Por ejemplo, no se puede cosechar un lote sin cultivo.
     */
    static isValidForLot(activity: Activity, lot: Lot): boolean {
        if (activity.type.value === 'Cosecha' && lot.crop === '') {
            return false;
        }
        return true;
    }
}