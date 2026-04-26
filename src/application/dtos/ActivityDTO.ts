export interface CreateActivityRequest {
    type: string;
    lot_id: string;
    crop: string;
    quantity: number;
    unit: string;
    date: string; // ISO
    notes?: string;
    farm_id: string;
}

export type UpdateActivityRequest = Partial<CreateActivityRequest>;

export interface ActivityDTO {
    id: string;
    type: string;
    lot_id: string;
    crop: string;
    quantity: number;
    unit: string;
    date: string;
    notes?: string;
    farm_id: string;
}