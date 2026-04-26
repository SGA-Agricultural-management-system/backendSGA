import { Lot } from './Lot';

export interface FarmProps {
    id: string;
    name: string;
    location: string;
}

export class Farm {
    private constructor(
        private readonly props: FarmProps,
        public readonly lots: Lot[] = [],
    ) { }

    get id(): string { return this.props.id; }
    get name(): string { return this.props.name; }
    get location(): string { return this.props.location; }

    static create(props: FarmProps, lots: Lot[] = []): Farm {
        return new Farm(props, lots);
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            location: this.location,
            lots: this.lots.map(lot => lot.toJSON()),
        };
    }
}