import { IActivityRepository } from '../../src/domain/repositories/IActivityRepository';
import { Activity } from '../../src/domain/entities/Activity';
import { PaginatedResult } from '../../src/shared/result/PaginatedResult';
import { ActivityQuery } from '../../src/application/dtos/ActivityQuery';

export class MockActivityRepository implements IActivityRepository {
    private activities: Activity[] = [];

    async findByFarmId(query: ActivityQuery): Promise<PaginatedResult<Activity>> {
        const filtered = this.activities.filter(a => a.farmId === query.farmId);
        const page = query.page;
        const limit = query.limit;
        const start = (page - 1) * limit;
        return {
            data: filtered.slice(start, start + limit),
            total: filtered.length,
            page,
            limit,
        };
    }

    async create(activity: Activity): Promise<Activity> {
        this.activities.push(activity);
        return activity;
    }

    async update(activity: Activity): Promise<Activity> {
        const idx = this.activities.findIndex(a => a.id === activity.id);
        if (idx >= 0) this.activities[idx] = activity;
        return activity;
    }

    async delete(id: string): Promise<void> {
        this.activities = this.activities.filter(a => a.id !== id);
    }

    async findById(id: string): Promise<Activity | null> {
        return this.activities.find(a => a.id === id) ?? null;
    }

    // Helpers
    addActivity(activity: Activity): void {
        this.activities.push(activity);
    }
}