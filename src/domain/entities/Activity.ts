import { ActivityType } from '../value-objects/ActivityType';
import { Quantity } from '../value-objects/Quantity';

export interface ActivityProps {
    id: string;
    type: ActivityType;
    lotId: string;
    crop: string;
    quantity: Quantity;
    date: Date;
    notes?: string;
    farmId: string;
}

export class Activity {
    private constructor(private readonly props: ActivityProps) { }

    get id(): string { return this.props.id; }
    get type(): ActivityType { return this.props.type; }
    get lotId(): string { return this.props.lotId; }
    get crop(): string { return this.props.crop; }
    get quantity(): Quantity { return this.props.quantity; }
    get date(): Date { return this.props.date; }
    get notes(): string | undefined { return this.props.notes; }
    get farmId(): string { return this.props.farmId; }

    static create(props: ActivityProps): Activity {
        return new Activity(props);
    }

    toJSON() {
        return {
            id: this.id,
            type: this.type.value, // Spanish label
            lot_id: this.lotId,
            crop: this.crop,
            quantity: this.quantity.amount,
            unit: this.quantity.unit,
            date: this.date.toISOString(),
            notes: this.notes,
            farm_id: this.farmId,
        };
    }
}