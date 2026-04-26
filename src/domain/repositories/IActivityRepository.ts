import { Activity } from '../entities/Activity';
import { PaginatedResult } from '@shared/result/PaginatedResult';
import { ActivityQuery } from '@application/dtos/ActivityQuery';

export interface IActivityRepository {
    findByFarmId(query: ActivityQuery): Promise<PaginatedResult<Activity>>;
    create(activity: Activity): Promise<Activity>;
    update(activity: Activity): Promise<Activity>;
    delete(id: string): Promise<void>;
    findById(id: string): Promise<Activity | null>;
}